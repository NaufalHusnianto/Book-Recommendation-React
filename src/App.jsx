import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Header from "./components/Header";
import BookCard from "./components/BookCard";
import RecommendationSection from "./components/RecommendationSection";
import UserProfile from "./components/UserProfile";
import "./styles/App.css";

// CSV Parser yang dioptimalkan dengan limit
const parseCSV = (csvText, limit = 50) => {
  try {
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    if (lines.length <= 1) return []; // Hanya header

    const headers = lines[0].split(",").map((header) => header.trim());
    const data = [];

    // Ambil hanya sejumlah data sesuai limit
    for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
      const line = lines[i];
      const values = [];
      let currentValue = "";
      let inQuotes = false;

      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue);
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : "";
      });

      // Hanya tambahkan jika ada data penting
      if (row.ISBN || row["User-ID"]) {
        data.push(row);
      }
    }

    return data;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
};

function App() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [usingDefaultData, setUsingDefaultData] = useState(false);

  // State untuk filter
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState([1900, 2024]);
  const [authorFilter, setAuthorFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Fungsi untuk membaca file CSV dengan limit
  const loadCSVFile = useCallback(async (filename, limit = 50) => {
    try {
      const response = await fetch(`/data/${filename}`);

      if (!response.ok) {
        throw new Error(`File ${filename} tidak ditemukan`);
      }

      const csvText = await response.text();
      const data = parseCSV(csvText, limit);

      if (data.length === 0) {
        console.warn(`File ${filename} kosong atau format salah`);
      }

      return data;
    } catch (err) {
      console.warn(`Error loading ${filename}:`, err.message);
      return [];
    }
  }, []);

  // Load semua data dengan limit
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Memulai loading data dengan limit...");

      // Set limit untuk masing-masing file
      const booksLimit = 1000; // Max 100 buku
      const usersLimit = 30; // Max 20 user
      const ratingsLimit = 300; // Max 200 rating

      // Load data
      const booksData = await loadCSVFile("books.csv", booksLimit);
      const usersData = await loadCSVFile("users.csv", usersLimit);
      const ratingsData = await loadCSVFile("ratings.csv", ratingsLimit);

      console.log(
        `Data loaded: ${booksData.length} buku, ${usersData.length} user, ${ratingsData.length} rating`
      );

      if (booksData.length === 0) {
        throw new Error("Data buku kosong atau format salah");
      }

      setBooks(booksData);
      setFilteredBooks(booksData); // Set filtered books awal sama dengan semua books
      setUsers(usersData);
      setRatings(ratingsData);

      if (usersData.length > 0) {
        setSelectedUser(usersData[0]);
      }

      setUsingDefaultData(false);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to load CSV files:", err);
      setError(`Gagal memuat data: ${err.message}`);
      setSnackbarOpen(true);
      setUsingDefaultData(true);
    } finally {
      setLoading(false);
    }
  }, [loadCSVFile]);

  // Filter data buku berdasarkan kriteria
  const applyFilters = useCallback(() => {
    let result = [...books];

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book["Book-Title"]?.toLowerCase().includes(query) ||
          book["Book-Author"]?.toLowerCase().includes(query) ||
          book.Publisher?.toLowerCase().includes(query) ||
          book.ISBN?.toLowerCase().includes(query)
      );
    }

    // Filter berdasarkan tahun
    result = result.filter((book) => {
      const year = parseInt(book["Year-Of-Publication"]) || 0;
      return year >= yearFilter[0] && year <= yearFilter[1];
    });

    // Filter berdasarkan author
    if (authorFilter) {
      result = result.filter((book) =>
        book["Book-Author"]?.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    // Filter berdasarkan publisher
    if (publisherFilter) {
      result = result.filter((book) =>
        book.Publisher?.toLowerCase().includes(publisherFilter.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a["Book-Title"] || "").localeCompare(b["Book-Title"] || "");
        case "author":
          return (a["Book-Author"] || "").localeCompare(b["Book-Author"] || "");
        case "year-desc":
          return (
            (parseInt(b["Year-Of-Publication"]) || 0) -
            (parseInt(a["Year-Of-Publication"]) || 0)
          );
        case "year-asc":
          return (
            (parseInt(a["Year-Of-Publication"]) || 0) -
            (parseInt(b["Year-Of-Publication"]) || 0)
          );
        default:
          return 0;
      }
    });

    setFilteredBooks(result);
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  }, [books, searchQuery, yearFilter, authorFilter, publisherFilter, sortBy]);

  // Reset semua filter
  const resetFilters = () => {
    setSearchQuery("");
    setYearFilter([1900, 2024]);
    setAuthorFilter("");
    setPublisherFilter("");
    setSortBy("title");
    setFilteredBooks(books);
    setCurrentPage(1);
  };

  // Load data saat pertama kali render
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Terapkan filter ketika criteria berubah
  useEffect(() => {
    if (books.length > 0) {
      applyFilters();
    }
  }, [books, applyFilters]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Hitung pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Get unique authors dan publishers untuk filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = [
      ...new Set(books.map((book) => book["Book-Author"]).filter(Boolean)),
    ];
    return authors.sort();
  }, [books]);

  const uniquePublishers = useMemo(() => {
    const publishers = [
      ...new Set(books.map((book) => book.Publisher).filter(Boolean)),
    ];
    return publishers.sort();
  }, [books]);

  // Hitung statistik
  const stats = useMemo(
    () => ({
      totalBooks: books.length,
      filteredBooks: filteredBooks.length,
      totalUsers: users.length,
      totalRatings: ratings.length,
      averageRating:
        ratings.length > 0
          ? (
              ratings.reduce(
                (sum, r) => sum + parseInt(r["Book-Rating"] || 0),
                0
              ) / ratings.length
            ).toFixed(1)
          : "0.0",
      minYear: Math.min(
        ...books
          .map((b) => parseInt(b["Year-Of-Publication"]) || 1900)
          .filter((y) => y > 0)
      ),
      maxYear: Math.max(
        ...books.map((b) => parseInt(b["Year-Of-Publication"]) || 2024)
      ),
    }),
    [books, filteredBooks, users, ratings]
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={3}
      >
        <CircularProgress size={80} />
        <Typography variant="h5" color="primary">
          Memuat Data (Limit: 100 buku, 20 user, 200 rating)
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Mengoptimalkan performa dengan membatasi data
        </Typography>
      </Box>
    );
  }

  return (
    <div className="App">
      <Header />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          variant="filled"
        >
          {error ||
            `Data berhasil dimuat! ${books.length} buku, ${users.length} user, ${ratings.length} rating`}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* Performance Warning */}
        {books.length > 50 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Mode Performa Aktif:</strong> Menampilkan {books.length}{" "}
            dari total data. Gunakan filter untuk hasil spesifik.
          </Alert>
        )}

        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                Etalase Buku (Optimized)
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Data difilter untuk performa optimal
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadAllData}
              sx={{ borderRadius: 2 }}
            >
              Muat Ulang
            </Button>
          </Box>

          {/* Stats Bar */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="TOTAL" color="primary" size="small" />
              <Typography variant="body2">{books.length} buku</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="FILTER" color="secondary" size="small" />
              <Typography variant="body2">
                {filteredBooks.length} hasil
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="PAGE" color="info" size="small" />
              <Typography variant="body2">
                Halaman {currentPage} dari {totalPages}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Data dibatasi untuk performa: 100 buku, 20 user, 200 rating
            </Typography>
          </Paper>
        </Box>

        <Grid container spacing={3}>
          {/* Sidebar dengan Filter */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{ p: 3, borderRadius: 2, position: "sticky", top: 20 }}
            >
              {/* Filter Header */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FilterListIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Filter & Sortir</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Reset Filter">
                  <IconButton size="small" onClick={resetFilters}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Search Box */}
              <TextField
                fullWidth
                label="Cari buku..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Year Filter */}
              <Typography variant="body2" gutterBottom>
                Tahun Terbit: {yearFilter[0]} - {yearFilter[1]}
              </Typography>
              <Slider
                value={yearFilter}
                onChange={(e, newValue) => setYearFilter(newValue)}
                valueLabelDisplay="auto"
                min={stats.minYear}
                max={stats.maxYear}
                step={1}
                sx={{ mb: 3 }}
              />

              {/* Author Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Penulis</InputLabel>
                <Select
                  value={authorFilter}
                  label="Penulis"
                  onChange={(e) => setAuthorFilter(e.target.value)}
                >
                  <MenuItem value="">Semua Penulis</MenuItem>
                  {uniqueAuthors.slice(0, 20).map((author) => (
                    <MenuItem key={author} value={author}>
                      {author}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Publisher Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Penerbit</InputLabel>
                <Select
                  value={publisherFilter}
                  label="Penerbit"
                  onChange={(e) => setPublisherFilter(e.target.value)}
                >
                  <MenuItem value="">Semua Penerbit</MenuItem>
                  {uniquePublishers.slice(0, 20).map((publisher) => (
                    <MenuItem key={publisher} value={publisher}>
                      {publisher}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort By */}
              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Urutkan Berdasarkan</InputLabel>
                <Select
                  value={sortBy}
                  label="Urutkan Berdasarkan"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="title">Judul (A-Z)</MenuItem>
                  <MenuItem value="author">Penulis (A-Z)</MenuItem>
                  <MenuItem value="year-desc">Tahun Terbit (Terbaru)</MenuItem>
                  <MenuItem value="year-asc">Tahun Terbit (Terlama)</MenuItem>
                </Select>
              </FormControl>

              {/* Items Per Page */}
              <Typography variant="body2" gutterBottom>
                Item per Halaman: {itemsPerPage}
              </Typography>
              <Slider
                value={itemsPerPage}
                onChange={(e, newValue) => setItemsPerPage(newValue)}
                valueLabelDisplay="auto"
                min={4}
                max={24}
                step={4}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
                sx={{ mb: 3 }}
              >
                Terapkan Filter
              </Button>

              {/* User Profile Section */}
              <UserProfile
                users={users}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
              />

              <Box sx={{ mt: 3 }}>
                <RecommendationSection
                  books={filteredBooks.slice(0, 5)} // Hanya 5 rekomendasi
                  ratings={ratings}
                  selectedUser={selectedUser}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Pagination Controls */}
            <Paper
              sx={{
                p: 2,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body1">
                Menampilkan {startIndex + 1}-
                {Math.min(endIndex, filteredBooks.length)} dari{" "}
                {filteredBooks.length} buku
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Sebelumnya
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      size="small"
                      variant={
                        currentPage === pageNum ? "contained" : "outlined"
                      }
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size="small"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Berikutnya
                </Button>
              </Box>
            </Paper>

            {/* Books Grid */}
            {currentBooks.length === 0 ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Tidak ada buku yang sesuai dengan filter
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    sx={{ mt: 2 }}
                  >
                    Reset Filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {currentBooks.map((book, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={book.ISBN || index}
                  >
                    <BookCard
                      book={book}
                      ratings={ratings}
                      selectedUser={selectedUser}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Bottom Pagination */}
            {filteredBooks.length > itemsPerPage && (
              <Paper
                sx={{ p: 2, mt: 3, display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Halaman {currentPage} dari {totalPages}
                  </Typography>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    First
                  </Button>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Prev
                  </Button>
                  <TextField
                    size="small"
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    inputProps={{ min: 1, max: totalPages }}
                    sx={{ width: 60 }}
                  />
                  <Button
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                  <Button
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    Last
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Performance Info */}
            <Card sx={{ mt: 4, p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Info Performa:</strong> Aplikasi ini menggunakan limit
                data untuk mencegah "web not responding". Data ditampilkan per
                halaman dengan filter yang efisien.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <footer
        style={{
          padding: "20px",
          marginTop: "40px",
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #ddd",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                © 2024 Book Recommendation System | Optimized Version
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 1, color: "text.disabled" }}
              >
                Data limit: 100 buku | 20 user | 200 rating | Pagination:{" "}
                {itemsPerPage}/page
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.disabled">
                Render time: {new Date().toLocaleTimeString()} | Items loaded:{" "}
                {currentBooks.length} | Total filtered: {filteredBooks.length}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
}

export default App;

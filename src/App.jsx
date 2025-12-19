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
  Tabs,
  Tab,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RecommendIcon from "@mui/icons-material/Recommend";
import Header from "./components/Header";
import BookCard from "./components/BookCard";
import RecommendationSection from "./components/RecommendationSection";
import UserProfile from "./components/UserProfile";
import "./styles/App.css";

// Konfigurasi API - LANGSUNG KE BACKEND
const API_BASE_URL = "http://192.168.215.87:8000"; // URL backend langsung
const TOP_N_RECOMMENDATIONS = 10;

function App() {
  const [allBooks, setAllBooks] = useState([]);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  // State untuk filter
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState([1900, 2024]);
  const [authorFilter, setAuthorFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  // Daftar user dummy untuk dipilih
  const [users] = useState([
    { "User-ID": 2, Age: 35, Location: "New York, USA" },
    { "User-ID": 5, Age: 28, Location: "London, UK" },
    { "User-ID": 10, Age: 42, Location: "Tokyo, Japan" },
    { "User-ID": 15, Age: 31, Location: "Sydney, Australia" },
    { "User-ID": 20, Age: 25, Location: "Berlin, Germany" },
    { "User-ID": 25, Age: 38, Location: "Paris, France" },
    { "User-ID": 30, Age: 45, Location: "Toronto, Canada" },
    { "User-ID": 35, Age: 29, Location: "Singapore" },
  ]);

  // Fungsi untuk mengambil rekomendasi berdasarkan user_id
  const fetchUserRecommendations = useCallback(
    async (userId, top_n = TOP_N_RECOMMENDATIONS) => {
      if (!userId) {
        setUserRecommendations([]);
        return [];
      }

      setLoadingRecommendations(true);
      setRecommendationError("");

      try {
        console.log(`Fetching recommendations for user ${userId}...`);
        const response = await fetch(
          `${API_BASE_URL}/recommend/${userId}?top_n=${top_n}`, // LANGSUNG KE BACKEND
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil rekomendasi (Status: ${response.status})`
          );
        }

        const data = await response.json();
        console.log("Recommendations data:", data);

        const recommendations = data.recommendations || [];
        setUserRecommendations(recommendations);

        if (recommendations.length > 0) {
          setActiveTab(1);
        } else {
          setRecommendationError(
            "Tidak ada rekomendasi tersedia untuk pengguna ini"
          );
        }

        return recommendations;
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendationError(`Error: ${error.message}`);
        setUserRecommendations([]);
        return [];
      } finally {
        setLoadingRecommendations(false);
      }
    },
    []
  );

  // Load semua data awal
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    setUserRecommendations([]);

    try {
      console.log("Memulai loading data...");

      // Gunakan data dummy untuk popular books
      const dummyBooks = [
        {
          ISBN: "0345417623",
          "Book-Title": "Timeline",
          "Year-Of-Publication": "2000",
          "Book-Author": "MICHAEL CRICHTON",
          Publisher: "Ballantine Books",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0345417623.01.LZZZZZZZ.jpg",
          predicted_rating: 10.66,
        },
        {
          ISBN: "0842329129",
          "Book-Title": "Left Behind: A Novel of the Earth's Last Days",
          "Year-Of-Publication": "1996",
          "Book-Author": "Tim Lahaye",
          Publisher: "Tyndale House Publishers",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0842329129.01.LZZZZZZZ.jpg",
          predicted_rating: 10.17,
        },
        {
          ISBN: "0060987103",
          "Book-Title":
            "Wicked: The Life and Times of the Wicked Witch of the West",
          "Year-Of-Publication": "1996",
          "Book-Author": "Gregory Maguire",
          Publisher: "Regan Books",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0060987103.01.LZZZZZZZ.jpg",
          predicted_rating: 10.07,
        },
        {
          ISBN: "0312278586",
          "Book-Title": "The Nanny Diaries: A Novel",
          "Year-Of-Publication": "2002",
          "Book-Author": "Emma McLaughlin",
          Publisher: "St. Martin's Press",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0312278586.01.LZZZZZZZ.jpg",
          predicted_rating: 4.97,
        },
        {
          ISBN: "0142001740",
          "Book-Title": "The Secret Life of Bees",
          "Year-Of-Publication": "2003",
          "Book-Author": "Sue Monk Kidd",
          Publisher: "Penguin Books",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0142001740.01.LZZZZZZZ.jpg",
          predicted_rating: 4.23,
        },
        {
          ISBN: "0671021001",
          "Book-Title": "She's Come Undone (Oprah's Book Club)",
          "Year-Of-Publication": "1998",
          "Book-Author": "Wally Lamb",
          Publisher: "Pocket",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0671021001.01.LZZZZZZZ.jpg",
          predicted_rating: 4.1,
        },
        {
          ISBN: "0385504209",
          "Book-Title": "The Da Vinci Code",
          "Year-Of-Publication": "2003",
          "Book-Author": "Dan Brown",
          Publisher: "Doubleday",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0385504209.01.LZZZZZZZ.jpg",
          predicted_rating: 4.05,
        },
        {
          ISBN: "0440241073",
          "Book-Title": "The Summons",
          "Year-Of-Publication": "2002",
          "Book-Author": "John Grisham",
          Publisher: "Dell Publishing Company",
          "Image-URL-L":
            "http://images.amazon.com/images/P/0440241073.01.LZZZZZZZ.jpg",
          predicted_rating: 3.91,
        },
      ];

      setAllBooks(dummyBooks);
      setFilteredBooks(dummyBooks);

      // Set user pertama sebagai default
      if (users.length > 0) {
        const firstUser = users[0];
        setSelectedUser(firstUser);
        // Otomatis fetch rekomendasi untuk user pertama
        await fetchUserRecommendations(firstUser["User-ID"]);
      }

      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(`Gagal memuat data: ${err.message}`);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [fetchUserRecommendations, users]);

  // Filter data buku berdasarkan kriteria
  const applyFilters = useCallback(() => {
    let result = [...allBooks];

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

    // Filter berdasarkan tahun (hanya untuk buku yang memiliki tahun)
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
        case "rating-desc":
          return (b.predicted_rating || 0) - (a.predicted_rating || 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(result);
    setCurrentPage(1);
  }, [
    allBooks,
    searchQuery,
    yearFilter,
    authorFilter,
    publisherFilter,
    sortBy,
  ]);

  // Reset semua filter
  const resetFilters = () => {
    setSearchQuery("");
    setYearFilter([1900, 2024]);
    setAuthorFilter("");
    setPublisherFilter("");
    setSortBy("title");
    setFilteredBooks(allBooks);
    setCurrentPage(1);
    setActiveTab(0);
  };

  // Handler untuk ganti user
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    await fetchUserRecommendations(user["User-ID"]);
  };

  // Handler untuk ganti tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Load data saat pertama kali render
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Terapkan filter ketika criteria berubah
  useEffect(() => {
    if (allBooks.length > 0) {
      applyFilters();
    }
  }, [allBooks, applyFilters]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Tentukan data yang akan ditampilkan berdasarkan tab aktif
  const displayBooks = activeTab === 0 ? filteredBooks : userRecommendations;

  // Hitung pagination untuk data yang ditampilkan
  const totalPages = Math.ceil(displayBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = displayBooks.slice(startIndex, endIndex);

  // Get unique authors dan publishers untuk filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = [
      ...new Set(allBooks.map((book) => book["Book-Author"]).filter(Boolean)),
    ];
    return authors.sort();
  }, [allBooks]);

  const uniquePublishers = useMemo(() => {
    const publishers = [
      ...new Set(allBooks.map((book) => book.Publisher).filter(Boolean)),
    ];
    return publishers.sort();
  }, [allBooks]);

  // Hitung statistik
  const stats = useMemo(() => {
    const minYear = Math.min(
      ...allBooks
        .map((b) => parseInt(b["Year-Of-Publication"]) || 1900)
        .filter((y) => y > 0)
    );
    const maxYear = Math.max(
      ...allBooks.map((b) => parseInt(b["Year-Of-Publication"]) || 2024)
    );

    return {
      totalBooks: allBooks.length,
      filteredBooks: filteredBooks.length,
      totalUsers: users.length,
      recommendationCount: userRecommendations.length,
      minYear: minYear === Infinity ? 1900 : minYear,
      maxYear: maxYear === -Infinity ? 2024 : maxYear,
    };
  }, [allBooks, filteredBooks, users, userRecommendations]);

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
          Memuat Data...
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Mengambil data buku dan rekomendasi personal
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
          {error || `Data berhasil dimuat! ${allBooks.length} buku tersedia`}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* API Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Mode API Aktif:</strong> Terhubung langsung ke backend di{" "}
          {API_BASE_URL}
        </Alert>

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
                Book Recommendation System
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {activeTab === 0 ? "Koleksi Buku" : "Rekomendasi Personal"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<RecommendIcon />}
                onClick={() => {
                  if (selectedUser) {
                    fetchUserRecommendations(selectedUser["User-ID"]);
                  } else {
                    setRecommendationError("Pilih user terlebih dahulu");
                  }
                }}
                disabled={!selectedUser || loadingRecommendations}
                sx={{ borderRadius: 2 }}
              >
                {loadingRecommendations ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Dapatkan Rekomendasi"
                )}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadAllData}
                sx={{ borderRadius: 2 }}
              >
                Refresh Data
              </Button>
            </Box>
          </Box>

          {/* Tabs untuk Semua Buku vs Rekomendasi */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{
                "& .MuiTab-root": {
                  fontWeight: "bold",
                  fontSize: "1rem",
                },
              }}
            >
              <Tab
                label={`Koleksi Buku (${allBooks.length})`}
                icon={<FilterListIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Rekomendasi (${userRecommendations.length})`}
                icon={<RecommendIcon />}
                iconPosition="start"
                disabled={userRecommendations.length === 0}
              />
            </Tabs>
          </Paper>

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
              <Chip
                label={activeTab === 0 ? "KOLEKSI" : "REKOMENDASI"}
                color={activeTab === 0 ? "primary" : "secondary"}
                size="small"
              />
              <Typography variant="body2">
                {activeTab === 0
                  ? `${allBooks.length} buku`
                  : `${userRecommendations.length} rekomendasi`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="FILTER" color="info" size="small" />
              <Typography variant="body2">
                {activeTab === 0
                  ? `${filteredBooks.length} hasil`
                  : "Rekomendasi personal"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="PAGE" color="warning" size="small" />
              <Typography variant="body2">
                Halaman {currentPage} dari {totalPages}
              </Typography>
            </Box>
            {activeTab === 1 && selectedUser && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="USER" color="success" size="small" />
                <Typography variant="body2">
                  User ID: {selectedUser["User-ID"]}
                </Typography>
              </Box>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Backend: {API_BASE_URL}
            </Typography>
          </Paper>

          {/* Error message untuk rekomendasi */}
          {recommendationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {recommendationError}
            </Alert>
          )}
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
                disabled={activeTab === 1}
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
                disabled={activeTab === 1}
                sx={{ mb: 3 }}
              />

              {/* Author Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Penulis</InputLabel>
                <Select
                  value={authorFilter}
                  label="Penulis"
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  disabled={activeTab === 1}
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
                  disabled={activeTab === 1}
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
                  disabled={activeTab === 1}
                >
                  <MenuItem value="title">Judul (A-Z)</MenuItem>
                  <MenuItem value="author">Penulis (A-Z)</MenuItem>
                  <MenuItem value="year-desc">Tahun Terbit (Terbaru)</MenuItem>
                  <MenuItem value="year-asc">Tahun Terbit (Terlama)</MenuItem>
                  <MenuItem value="rating-desc">
                    Rating Prediksi (Tertinggi)
                  </MenuItem>
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
                disabled={activeTab === 1}
                sx={{ mb: 3 }}
              >
                Terapkan Filter
              </Button>

              {/* User Profile Section */}
              <UserProfile
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleUserSelect}
              />

              {/* Recommendation Section di Sidebar */}
              <Box sx={{ mt: 3 }}>
                <RecommendationSection
                  selectedUser={selectedUser}
                  userRecommendations={userRecommendations.slice(0, 3)}
                  title="Rekomendasi Teratas"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Tab Info */}
            {activeTab === 1 && selectedUser && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>
                  Rekomendasi Personal untuk User ID: {selectedUser["User-ID"]}
                </strong>
                <br />
                Buku-buku ini direkomendasikan khusus untuk Anda berdasarkan
                algoritma recommendation system. Prediksi rating menunjukkan
                seberapa besar kemungkinan Anda menyukai buku tersebut.
              </Alert>
            )}

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
                {Math.min(endIndex, displayBooks.length)} dari{" "}
                {displayBooks.length} {activeTab === 0 ? "buku" : "rekomendasi"}
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
                    {activeTab === 0
                      ? "Tidak ada buku yang sesuai dengan filter"
                      : "Tidak ada rekomendasi tersedia. Coba pilih user lain atau klik 'Dapatkan Rekomendasi'"}
                  </Typography>
                  {activeTab === 0 ? (
                    <Button
                      variant="outlined"
                      onClick={resetFilters}
                      sx={{ mt: 2 }}
                    >
                      Reset Filter
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setActiveTab(0);
                        resetFilters();
                      }}
                      sx={{ mt: 2 }}
                    >
                      Lihat Koleksi Buku
                    </Button>
                  )}
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
                      isRecommendation={activeTab === 1}
                      predictedRating={
                        activeTab === 1 ? book.predicted_rating : null
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Bottom Pagination */}
            {displayBooks.length > itemsPerPage && (
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

            {/* API Info */}
            <Card sx={{ mt: 4, p: 2, bgcolor: "grey.50" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>API Information:</strong> Terhubung langsung ke backend
                recommendation system di {API_BASE_URL}
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
                © 2024 Book Recommendation System | Direct API Connection
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                display="block"
              >
                Backend URL: {API_BASE_URL}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.disabled">
                Render time: {new Date().toLocaleTimeString()} | Mode:{" "}
                {activeTab === 0 ? "Collection" : "Recommendations"} | Items
                loaded: {currentBooks.length} | Active user:{" "}
                {selectedUser ? `ID: ${selectedUser["User-ID"]}` : "None"}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
}

export default App;

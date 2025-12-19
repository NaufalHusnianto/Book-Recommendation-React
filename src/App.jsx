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
const API_BASE_URL = "http://192.168.215.87:8000";
const TOP_N_RECOMMENDATIONS = 10;

function App() {
  const [allBooks, setAllBooks] = useState([]); // Semua buku yang tersedia
  const [userRecommendations, setUserRecommendations] = useState([]); // Rekomendasi untuk user
  const [userSpecificBooks, setUserSpecificBooks] = useState([]); // Buku khusus untuk user saat ini
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

  // Data buku demo untuk semua user
  const DEMO_BOOKS = useMemo(
    () => [
      // Buku untuk User ID 2
      {
        ISBN: "0345417623",
        "Book-Title": "Timeline",
        "Year-Of-Publication": "2000",
        "Book-Author": "MICHAEL CRICHTON",
        Publisher: "Ballantine Books",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0345417623.01.LZZZZZZZ.jpg",
        predicted_rating: 10.66,
        user_id: 2,
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
        user_id: 2,
      },
      // Buku untuk User ID 5 (dari API response Anda)
      {
        ISBN: "0312278586",
        "Book-Title": "The Nanny Diaries: A Novel",
        "Year-Of-Publication": "2002",
        "Book-Author": "Emma McLaughlin",
        Publisher: "St. Martin's Press",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0312278586.01.LZZZZZZZ.jpg",
        predicted_rating: 4.97,
        user_id: 5,
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
        user_id: 5,
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
        user_id: 5,
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
        user_id: 5,
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
        user_id: 5,
      },
      // Buku untuk User ID 10
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
        user_id: 10,
      },
      {
        ISBN: "0451205367",
        "Book-Title": "Angels & Demons",
        "Year-Of-Publication": "2001",
        "Book-Author": "Dan Brown",
        Publisher: "Pocket Star",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0451205367.01.LZZZZZZZ.jpg",
        predicted_rating: 9.5,
        user_id: 10,
      },
      // Buku untuk User ID 15
      {
        ISBN: "1400032717",
        "Book-Title": "The Kite Runner",
        "Year-Of-Publication": "2004",
        "Book-Author": "Khaled Hosseini",
        Publisher: "Riverhead Books",
        "Image-URL-L":
          "http://images.amazon.com/images/P/1400032717.01.LZZZZZZZ.jpg",
        predicted_rating: 9.8,
        user_id: 15,
      },
      // Buku umum (tanpa user_id khusus)
      {
        ISBN: "0439136350",
        "Book-Title": "Harry Potter and the Prisoner of Azkaban",
        "Year-Of-Publication": "2001",
        "Book-Author": "J.K. Rowling",
        Publisher: "Scholastic",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0439136350.01.LZZZZZZZ.jpg",
        predicted_rating: 9.9,
      },
      {
        ISBN: "0439139597",
        "Book-Title": "Harry Potter and the Goblet of Fire",
        "Year-Of-Publication": "2002",
        "Book-Author": "J.K. Rowling",
        Publisher: "Scholastic",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0439139597.01.LZZZZZZZ.jpg",
        predicted_rating: 9.8,
      },
      {
        ISBN: "0439784549",
        "Book-Title": "Harry Potter and the Order of the Phoenix",
        "Year-Of-Publication": "2004",
        "Book-Author": "J.K. Rowling",
        Publisher: "Scholastic",
        "Image-URL-L":
          "http://images.amazon.com/images/P/0439784549.01.LZZZZZZZ.jpg",
        predicted_rating: 9.7,
      },
    ],
    []
  );

  // Fungsi untuk mengambil rekomendasi dari API
  const fetchUserRecommendations = useCallback(
    async (userId, top_n = TOP_N_RECOMMENDATIONS) => {
      if (!userId) {
        setUserRecommendations([]);
        setUserSpecificBooks([]);
        return [];
      }

      setLoadingRecommendations(true);
      setRecommendationError("");

      try {
        console.log(`Fetching recommendations for user ${userId}...`);
        const response = await fetch(
          `${API_BASE_URL}/recommend/${userId}?top_n=${top_n}`,
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

        // Set rekomendasi untuk tab 1
        setUserRecommendations(recommendations);

        // Filter buku yang sesuai dengan user untuk tab 0
        const userBooks = DEMO_BOOKS.filter(
          (book) =>
            !book.user_id || // Buku umum tanpa user_id
            book.user_id === userId || // Buku khusus untuk user ini
            recommendations.some((rec) => rec.ISBN === book.ISBN) // Buku yang ada di rekomendasi
        );

        // Tambahkan buku dari API response ke userSpecificBooks
        const apiBooks = recommendations.map((rec) => ({
          ...rec,
          user_id: userId,
          is_from_api: true,
        }));

        // Gabungkan buku demo dan buku dari API
        const combinedBooks = [...userBooks, ...apiBooks];

        // Hapus duplikat berdasarkan ISBN
        const uniqueBooks = Array.from(
          new Map(combinedBooks.map((book) => [book.ISBN, book])).values()
        );

        setUserSpecificBooks(uniqueBooks);

        // Jika ada rekomendasi, set tab aktif ke koleksi buku user
        if (recommendations.length > 0) {
          setActiveTab(0); // Set ke tab Koleksi Buku User
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

        // Gunakan buku demo untuk user ini sebagai fallback
        const userBooks = DEMO_BOOKS.filter(
          (book) => !book.user_id || book.user_id === userId
        );
        setUserSpecificBooks(userBooks);

        return [];
      } finally {
        setLoadingRecommendations(false);
      }
    },
    [DEMO_BOOKS]
  );

  // Load semua data awal
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    setUserRecommendations([]);

    try {
      console.log("Memulai loading data...");

      // Set semua buku demo
      setAllBooks(DEMO_BOOKS);

      // Set user pertama sebagai default
      if (users.length > 0) {
        const firstUser = users[0];
        setSelectedUser(firstUser);
        // Otomatis fetch rekomendasi untuk user pertama
        await fetchUserRecommendations(firstUser["User-ID"]);
      } else {
        // Jika tidak ada user, tampilkan semua buku
        setUserSpecificBooks(DEMO_BOOKS);
        setFilteredBooks(DEMO_BOOKS);
      }

      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(`Gagal memuat data: ${err.message}`);
      setSnackbarOpen(true);

      // Fallback ke data demo
      setAllBooks(DEMO_BOOKS);
      setUserSpecificBooks(DEMO_BOOKS);
      setFilteredBooks(DEMO_BOOKS);
    } finally {
      setLoading(false);
    }
  }, [DEMO_BOOKS, fetchUserRecommendations, users]);

  // Filter data buku berdasarkan kriteria
  const applyFilters = useCallback(() => {
    let result =
      activeTab === 0 ? [...userSpecificBooks] : [...userRecommendations];

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
    activeTab,
    userSpecificBooks,
    userRecommendations,
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
    setFilteredBooks(activeTab === 0 ? userSpecificBooks : userRecommendations);
    setCurrentPage(1);
  };

  // Handler untuk ganti user
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    await fetchUserRecommendations(user["User-ID"]);
  };

  // Handler untuk ganti tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset filter ke data yang sesuai dengan tab
    if (newValue === 0) {
      setFilteredBooks(userSpecificBooks);
    } else {
      setFilteredBooks(userRecommendations);
    }
    setCurrentPage(1);
  };

  // Load data saat pertama kali render
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Terapkan filter ketika criteria berubah
  useEffect(() => {
    if (
      (activeTab === 0 && userSpecificBooks.length > 0) ||
      (activeTab === 1 && userRecommendations.length > 0)
    ) {
      applyFilters();
    }
  }, [activeTab, userSpecificBooks, userRecommendations, applyFilters]);

  // Update filteredBooks ketika userSpecificBooks berubah
  useEffect(() => {
    if (activeTab === 0 && userSpecificBooks.length > 0) {
      setFilteredBooks(userSpecificBooks);
    }
  }, [activeTab, userSpecificBooks]);

  // Update filteredBooks ketika userRecommendations berubah
  useEffect(() => {
    if (activeTab === 1 && userRecommendations.length > 0) {
      setFilteredBooks(userRecommendations);
    }
  }, [activeTab, userRecommendations]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Tentukan data yang akan ditampilkan berdasarkan tab aktif
  const displayBooks = filteredBooks;

  // Hitung pagination untuk data yang ditampilkan
  const totalPages = Math.ceil(displayBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = displayBooks.slice(startIndex, endIndex);

  // Get unique authors dan publishers untuk filter dropdown
  const uniqueAuthors = useMemo(() => {
    const booksToUse =
      activeTab === 0 ? userSpecificBooks : userRecommendations;
    const authors = [
      ...new Set(booksToUse.map((book) => book["Book-Author"]).filter(Boolean)),
    ];
    return authors.sort();
  }, [activeTab, userSpecificBooks, userRecommendations]);

  const uniquePublishers = useMemo(() => {
    const booksToUse =
      activeTab === 0 ? userSpecificBooks : userRecommendations;
    const publishers = [
      ...new Set(booksToUse.map((book) => book.Publisher).filter(Boolean)),
    ];
    return publishers.sort();
  }, [activeTab, userSpecificBooks, userRecommendations]);

  // Hitung statistik
  const stats = useMemo(() => {
    const booksToUse =
      activeTab === 0 ? userSpecificBooks : userRecommendations;

    const years = booksToUse
      .map((b) => parseInt(b["Year-Of-Publication"]) || 0)
      .filter((y) => y > 0);

    const minYear = years.length > 0 ? Math.min(...years) : 1900;
    const maxYear = years.length > 0 ? Math.max(...years) : 2024;

    return {
      totalBooks: booksToUse.length,
      filteredBooks: filteredBooks.length,
      totalUsers: users.length,
      recommendationCount: userRecommendations.length,
      minYear: minYear === Infinity ? 1900 : minYear,
      maxYear: maxYear === -Infinity ? 2024 : maxYear,
    };
  }, [activeTab, userSpecificBooks, userRecommendations, filteredBooks, users]);

  // Judul tab berdasarkan user
  const getTabLabel = () => {
    if (activeTab === 0) {
      return selectedUser
        ? `Koleksi Buku User ${selectedUser["User-ID"]}`
        : "Koleksi Buku";
    } else {
      return "Rekomendasi Personal";
    }
  };

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
          {error ||
            `Data berhasil dimuat! ${
              userSpecificBooks.length
            } buku tersedia untuk user ${
              selectedUser ? selectedUser["User-ID"] : "terpilih"
            }`}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* API Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Mode API Aktif:</strong> Terhubung langsung ke backend di{" "}
          {API_BASE_URL}
          {selectedUser && ` | User Aktif: ${selectedUser["User-ID"]}`}
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
                {getTabLabel()}
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
                  "Refresh Rekomendasi"
                )}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadAllData}
                sx={{ borderRadius: 2 }}
              >
                Reset Semua
              </Button>
            </Box>
          </Box>

          {/* Tabs untuk Koleksi Buku User vs Rekomendasi */}
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
                label={
                  selectedUser
                    ? `Buku User ${selectedUser["User-ID"]} (${userSpecificBooks.length})`
                    : `Koleksi Buku (${userSpecificBooks.length})`
                }
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

          {/* User Info Bar */}
          {selectedUser && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "primary.light",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  User ID: {selectedUser["User-ID"]}
                </Typography>
                <Typography variant="body2">
                  {selectedUser.Age && `Umur: ${selectedUser.Age} • `}
                  {selectedUser.Location && `Lokasi: ${selectedUser.Location}`}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={`${userSpecificBooks.length} Buku`}
                  size="small"
                  sx={{ bgcolor: "white", color: "primary.main" }}
                />
                <Chip
                  label={`${userRecommendations.length} Rekomendasi`}
                  size="small"
                  sx={{ bgcolor: "white", color: "secondary.main" }}
                />
              </Box>
            </Paper>
          )}

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
                label={activeTab === 0 ? "KOLEKSI USER" : "REKOMENDASI"}
                color={activeTab === 0 ? "primary" : "secondary"}
                size="small"
              />
              <Typography variant="body2">
                {activeTab === 0
                  ? `${userSpecificBooks.length} buku untuk user ${
                      selectedUser ? selectedUser["User-ID"] : ""
                    }`
                  : `${userRecommendations.length} rekomendasi personal`}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="FILTER" color="info" size="small" />
              <Typography variant="body2">
                {filteredBooks.length} hasil
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label="PAGE" color="warning" size="small" />
              <Typography variant="body2">
                Halaman {currentPage} dari {totalPages}
              </Typography>
            </Box>
            {selectedUser && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="USER" color="success" size="small" />
                <Typography variant="body2">
                  ID: {selectedUser["User-ID"]}
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

              {/* User Info in Sidebar */}
              {selectedUser && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    User: {selectedUser["User-ID"]}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {selectedUser.Age && `Umur: ${selectedUser.Age}`}
                    {selectedUser.Location && ` • ${selectedUser.Location}`}
                  </Typography>
                </Alert>
              )}

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
            {/* Tab Description */}
            {activeTab === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>
                  {selectedUser
                    ? `Koleksi Buku untuk User ${selectedUser["User-ID"]}`
                    : "Koleksi Buku"}
                </strong>
                <br />
                {selectedUser
                  ? `Menampilkan buku-buku yang sesuai dengan preferensi dan rekomendasi untuk User ${selectedUser["User-ID"]}. Termasuk buku dari rekomendasi API dan koleksi khusus user.`
                  : "Menampilkan koleksi buku yang tersedia."}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>
                  Rekomendasi Personal untuk User {selectedUser?.["User-ID"]}
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
                {displayBooks.length}{" "}
                {activeTab === 0 ? "buku dalam koleksi" : "rekomendasi"}
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
                      ? selectedUser
                        ? "Tidak ada buku yang sesuai dengan filter untuk user ini"
                        : "Tidak ada buku yang sesuai dengan filter"
                      : "Tidak ada rekomendasi tersedia. Coba pilih user lain atau klik 'Refresh Rekomendasi'"}
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
                    key={`${book.ISBN}-${index}`}
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
                {selectedUser && (
                  <>
                    <br />
                    <strong>Endpoint aktif:</strong> /recommend/
                    {selectedUser["User-ID"]}
                  </>
                )}
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
                {selectedUser && ` | User Aktif: ${selectedUser["User-ID"]}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.disabled">
                Render time: {new Date().toLocaleTimeString()} | Mode:{" "}
                {activeTab === 0 ? "User Collection" : "Recommendations"} |
                Items loaded: {currentBooks.length} | Active user:{" "}
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

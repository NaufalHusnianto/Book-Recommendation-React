import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import RecommendIcon from "@mui/icons-material/Recommend";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import BookmarkIcon from "@mui/icons-material/Bookmark";

// Konfigurasi API - LANGSUNG KE BACKEND
const API_BASE_URL = "http://192.168.215.87:8000"; // URL backend langsung

// Data fallback
const FALLBACK_RECOMMENDATIONS = [
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
    "Book-Title": "Wicked: The Life and Times of the Wicked Witch of the West",
    "Year-Of-Publication": "1996",
    "Book-Author": "Gregory Maguire",
    Publisher: "Regan Books",
    "Image-URL-L":
      "http://images.amazon.com/images/P/0060987103.01.LZZZZZZZ.jpg",
    predicted_rating: 10.07,
  },
];

const RecommendationSection = ({
  selectedUser,
  userRecommendations = [],
  title = "Rekomendasi Personal",
  maxItems = 3,
  apiConnected = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [localRecommendations, setLocalRecommendations] = useState([]);
  const [localApiConnected, setLocalApiConnected] = useState(apiConnected);

  // Jika ada userRecommendations dari props, gunakan itu
  useEffect(() => {
    if (userRecommendations && userRecommendations.length > 0) {
      setLocalRecommendations(userRecommendations);
      setError("");
    } else {
      setLocalRecommendations([]);
    }
    setLocalApiConnected(apiConnected);
  }, [userRecommendations, apiConnected]);

  // Fetch rekomendasi dari API
  const fetchUserRecommendations = async (userId) => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      console.log(`Fetching recommendations for user ${userId}...`);
      const response = await fetch(
        `${API_BASE_URL}/recommend/${userId}?top_n=10`, // LANGSUNG KE BACKEND
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Recommendations data:", data);

      if (data.recommendations && data.recommendations.length > 0) {
        setLocalRecommendations(data.recommendations);
        setLocalApiConnected(true);
      } else {
        setLocalRecommendations(FALLBACK_RECOMMENDATIONS);
        setError("Tidak ada rekomendasi dari API, menggunakan data demo");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(`Tidak dapat terhubung ke API: ${error.message}`);
      setLocalApiConnected(false);
      setLocalRecommendations(FALLBACK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  };

  // Load data berdasarkan kondisi
  useEffect(() => {
    if (selectedUser && selectedUser["User-ID"]) {
      if (userRecommendations.length === 0) {
        fetchUserRecommendations(selectedUser["User-ID"]);
      }
    } else if (userRecommendations.length === 0) {
      setLocalRecommendations(FALLBACK_RECOMMENDATIONS);
      setError("Tidak ada user yang dipilih, menggunakan data contoh");
    }
  }, [selectedUser, userRecommendations]);

  // Tentukan data yang akan ditampilkan
  const displayData = showAll
    ? localRecommendations
    : localRecommendations.slice(0, maxItems);

  const handleRefresh = () => {
    if (selectedUser && selectedUser["User-ID"]) {
      fetchUserRecommendations(selectedUser["User-ID"]);
    } else {
      setLocalRecommendations(FALLBACK_RECOMMENDATIONS);
      setError("Tidak ada user yang dipilih, menggunakan data contoh");
    }
  };

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress size={30} />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Memuat data...
        </Typography>
      </Box>
    );
  }

  if (error && localRecommendations.length === 0) {
    return (
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          {selectedUser ? (
            <RecommendIcon sx={{ mr: 1 }} />
          ) : (
            <TrendingUpIcon sx={{ mr: 1 }} />
          )}
          {title}
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
        >
          Coba Lagi
        </Button>
      </Box>
    );
  }

  if (localRecommendations.length === 0 && !loading) {
    return (
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <BookmarkIcon sx={{ mr: 1 }} />
          {title}
        </Typography>
        <Alert severity="info">
          {selectedUser
            ? "Belum ada rekomendasi untuk user ini"
            : "Tidak ada data yang tersedia"}
        </Alert>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header dengan controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          {selectedUser ? (
            <>
              <RecommendIcon sx={{ mr: 1 }} />
              {title}
            </>
          ) : (
            <>
              <TrendingUpIcon sx={{ mr: 1 }} />
              Buku Terpopuler
            </>
          )}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          {localRecommendations.length > maxItems && (
            <Tooltip title={showAll ? "Tampilkan Sedikit" : "Tampilkan Semua"}>
              <Button size="small" onClick={handleShowAll} variant="outlined">
                {showAll ? "Kecilkan" : "Lihat Semua"}
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Refresh Data">
            <Button
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              variant="contained"
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* User Info */}
      {selectedUser && (
        <Box sx={{ mb: 2, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
            User ID: {selectedUser["User-ID"]}
            {selectedUser.Age && ` • Umur: ${selectedUser.Age}`}
            {selectedUser.Location && ` • Lokasi: ${selectedUser.Location}`}
          </Typography>
        </Box>
      )}

      {/* Connection Status */}
      {!localApiConnected && (
        <Alert severity="info" sx={{ mb: 2, py: 0 }}>
          <Typography variant="caption">
            Mode Demo: Menampilkan data contoh
          </Typography>
        </Alert>
      )}

      {/* Recommendation List */}
      <List sx={{ width: "100%" }}>
        {displayData.map((book, index) => (
          <React.Fragment key={book.ISBN || `rec-${index}`}>
            <ListItem alignItems="flex-start" sx={{ py: 1 }}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor:
                      index === 0
                        ? selectedUser
                          ? "#1976d2"
                          : "gold"
                        : index === 1
                        ? selectedUser
                          ? "#2e7d32"
                          : "silver"
                        : index === 2
                        ? selectedUser
                          ? "#ed6c02"
                          : "#cd7f32"
                        : "primary.main",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {book["Book-Title"] || "Judul tidak tersedia"}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {/* Tampilkan predicted rating */}
                    {book.predicted_rating && (
                      <Tooltip
                        title={
                          selectedUser
                            ? "Rating prediksi"
                            : "Rating popularitas"
                        }
                      >
                        <Chip
                          icon={<StarIcon />}
                          label={`${parseFloat(book.predicted_rating).toFixed(
                            1
                          )}/10`}
                          size="small"
                          color={selectedUser ? "secondary" : "primary"}
                          variant="filled"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: selectedUser
                              ? "#9c27b0"
                              : undefined,
                          }}
                        />
                      </Tooltip>
                    )}

                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      noWrap
                    >
                      {book["Book-Author"] || "Penulis tidak diketahui"}
                    </Typography>

                    {book.Publisher && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        fontSize="0.7rem"
                        noWrap
                      >
                        {book.Publisher}
                      </Typography>
                    )}

                    {book["Year-Of-Publication"] && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        fontSize="0.7rem"
                      >
                        Tahun: {book["Year-Of-Publication"]}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < displayData.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Info Footer */}
      {localRecommendations.length > maxItems && !showAll && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Menampilkan {maxItems} dari {localRecommendations.length}{" "}
          {selectedUser ? "rekomendasi" : "buku popular"}
        </Typography>
      )}

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 1, fontSize: "0.65rem" }}
      >
        Status: {localApiConnected ? "Terhubung ke API" : "Mode Demo"} | Data:{" "}
        {localRecommendations.length} items | Backend: {API_BASE_URL}
      </Typography>
    </Box>
  );
};

export default RecommendationSection;

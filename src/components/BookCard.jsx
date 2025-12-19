import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Rating,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const BookCard = ({
  book,
  isRecommendation = false,
  predictedRating = null,
}) => {
  // Format rating untuk ditampilkan
  const formatRating = (rating) => {
    if (!rating) return "N/A";
    return parseFloat(rating).toFixed(1);
  };

  // Ambil tahun publikasi
  const year = book["Year-Of-Publication"] || "Tahun tidak diketahui";

  // Hitung rating untuk display
  const displayRating = isRecommendation ? predictedRating : null;
  const ratingValue = displayRating
    ? Math.min(parseFloat(displayRating) / 2, 5)
    : 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Book Cover */}
      <CardMedia
        component="img"
        height="200"
        image={
          book["Image-URL-L"] ||
          book["Image-URL-M"] ||
          book["Image-URL-S"] ||
          "https://via.placeholder.com/150x200?text=No+Cover"
        }
        alt={book["Book-Title"] || "Book cover"}
        sx={{
          objectFit: "cover",
          bgcolor: "grey.100",
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Rating Chip */}
        {(displayRating || isRecommendation) && (
          <Box
            sx={{
              mb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Chip
              icon={<StarIcon />}
              label={
                <Typography variant="body2" fontWeight="bold">
                  {formatRating(displayRating)}
                  {isRecommendation ? " (Prediksi)" : ""}
                </Typography>
              }
              color={isRecommendation ? "secondary" : "primary"}
              variant="filled"
              size="small"
            />

            {isRecommendation && (
              <Chip
                label="Rekomendasi"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* Book Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: "1rem",
            fontWeight: "bold",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "2.8em",
            lineHeight: "1.4em",
          }}
        >
          {book["Book-Title"] || "Judul tidak tersedia"}
        </Typography>

        {/* Author */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontStyle: "italic",
          }}
        >
          {book["Book-Author"] || "Penulis tidak diketahui"}
        </Typography>

        {/* Publisher */}
        {book.Publisher && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.Publisher}
          </Typography>
        )}

        {/* Year */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 1 }}
        >
          Tahun: {year}
        </Typography>

        {/* ISBN */}
        {book.ISBN && (
          <Typography variant="caption" color="text.disabled" display="block">
            ISBN: {book.ISBN.substring(0, 10)}...
          </Typography>
        )}

        {/* Rating Stars (jika ada rating) */}
        {ratingValue > 0 && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={`Rating: ${formatRating(displayRating)}/10`}>
              <Box>
                <Rating
                  value={ratingValue}
                  precision={0.5}
                  readOnly
                  size="small"
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                />
              </Box>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              ({formatRating(displayRating)})
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCard;

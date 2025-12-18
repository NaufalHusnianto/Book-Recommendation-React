import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";

const BookCard = ({ book, ratings, selectedUser, index }) => {
  const getBookRating = (isbn) => {
    const bookRatings = ratings.filter((r) => r.ISBN === isbn);
    if (bookRatings.length === 0) return 0;

    const avgRating =
      bookRatings.reduce((sum, r) => sum + parseInt(r["Book-Rating"]), 0) /
      bookRatings.length;
    return avgRating;
  };

  const getUserRating = (isbn) => {
    if (!selectedUser) return null;
    const userRating = ratings.find(
      (r) => r["User-ID"] === selectedUser["User-ID"] && r.ISBN === isbn
    );
    return userRating ? parseInt(userRating["Book-Rating"]) : null;
  };

  const rating = getBookRating(book.ISBN);
  const userRating = getUserRating(book.ISBN);

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
      <CardMedia
        component="img"
        height="200"
        image={
          book["Image-URL-L"] ||
          book["Image-URL-M"] ||
          book["Image-URL-S"] ||
          "https://via.placeholder.com/150x200?text=No+Image"
        }
        alt={book["Book-Title"]}
        sx={{ objectFit: "cover" }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book["Book-Title"]}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          by {book["Book-Author"]}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Rating value={rating / 2} precision={0.5} readOnly size="small" />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {rating.toFixed(1)}/10
          </Typography>
        </Box>

        {userRating && (
          <Chip
            label={`Your rating: ${userRating}/10`}
            color="primary"
            size="small"
            sx={{ mb: 1 }}
          />
        )}

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
          <Chip label={book.Publisher} size="small" variant="outlined" />
          <Chip
            label={book["Year-Of-Publication"]}
            size="small"
            variant="outlined"
          />
          <Chip label={book.ISBN} size="small" variant="outlined" />
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" startIcon={<FavoriteIcon />}>
          Wishlist
        </Button>
        <Button size="small" startIcon={<ShareIcon />}>
          Share
        </Button>
      </CardActions>
    </Card>
  );
};

export default BookCard;

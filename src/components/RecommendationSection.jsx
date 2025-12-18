import React from "react";
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
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";

const RecommendationSection = ({ books, ratings, selectedUser }) => {
  // Simulasi rekomendasi berdasarkan rating
  const getTopRatedBooks = () => {
    const bookRatings = books.map((book) => {
      const bookRatingsList = ratings.filter((r) => r.ISBN === book.ISBN);
      const avgRating =
        bookRatingsList.length > 0
          ? bookRatingsList.reduce(
              (sum, r) => sum + parseInt(r["Book-Rating"]),
              0
            ) / bookRatingsList.length
          : 0;
      return { ...book, avgRating };
    });

    return bookRatings.sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
  };

  const topBooks = getTopRatedBooks();

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <TrendingUpIcon sx={{ mr: 1 }} />
        Top Recommendations
      </Typography>

      <List sx={{ width: "100%" }}>
        {topBooks.map((book, index) => (
          <React.Fragment key={book.ISBN}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor:
                      index === 0
                        ? "gold"
                        : index === 1
                        ? "silver"
                        : index === 2
                        ? "#cd7f32"
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
                    {book["Book-Title"]}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={<StarIcon />}
                      label={`${book.avgRating.toFixed(1)}/10`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {book["Book-Author"]}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < topBooks.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
        <Typography variant="body2" color="primary.contrastText">
          <strong>Tip:</strong> Books with higher average ratings are more
          likely to match your preferences.
        </Typography>
      </Box>
    </Box>
  );
};

export default RecommendationSection;

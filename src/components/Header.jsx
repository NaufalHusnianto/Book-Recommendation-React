import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";

const Header = () => {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <MenuBookIcon sx={{ mr: 2, fontSize: 30 }} />

        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          BookVerse
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Discover Your Next Favorite Book
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

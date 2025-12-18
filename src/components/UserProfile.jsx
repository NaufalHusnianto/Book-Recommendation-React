import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";

const UserProfile = ({ users, selectedUser, onSelectUser }) => {
  const getUserStats = (userId) => {
    const userRatings = users.filter((u) => u["User-ID"] === userId).length;
    return {
      booksRated: userRatings,
      memberSince: "2023",
    };
  };

  const stats = selectedUser
    ? getUserStats(selectedUser["User-ID"])
    : { booksRated: 0, memberSince: "2023" };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6">
              User {selectedUser ? selectedUser["User-ID"] : "1"}
            </Typography>
            <Chip
              label="Reader"
              size="small"
              color="secondary"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
            {selectedUser?.Location || "Location not specified"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <CakeIcon fontSize="small" sx={{ mr: 1 }} />
            Age: {selectedUser?.Age || "N/A"} years
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl fullWidth size="small">
          <InputLabel>Switch User</InputLabel>
          <Select
            value={selectedUser?.["User-ID"] || ""}
            label="Switch User"
            onChange={(e) => {
              const user = users.find((u) => u["User-ID"] === e.target.value);
              if (user) onSelectUser(user);
            }}
          >
            {users.map((user) => (
              <MenuItem key={user["User-ID"]} value={user["User-ID"]}>
                User {user["User-ID"]} - {user.Location.split(",")[0]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            User Statistics
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Box>
              <Typography variant="h6" align="center">
                {stats.booksRated}
              </Typography>
              <Typography variant="caption" display="block">
                Books Rated
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" align="center">
                {stats.memberSince}
              </Typography>
              <Typography variant="caption" display="block">
                Member Since
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserProfile;

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";

const UserProfile = ({ users, selectedUser, onSelectUser }) => {
  if (!users || users.length === 0) {
    return (
      <Box>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <PersonIcon sx={{ mr: 1 }} />
          Pilih User
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tidak ada user tersedia
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <PersonIcon sx={{ mr: 1 }} />
        Profil User
      </Typography>

      {/* User Selection */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Pilih User</InputLabel>
        <Select
          value={selectedUser ? selectedUser["User-ID"] : ""}
          label="Pilih User"
          onChange={(e) => {
            const user = users.find((u) => u["User-ID"] === e.target.value);
            if (user) onSelectUser(user);
          }}
        >
          {users.map((user) => (
            <MenuItem key={user["User-ID"]} value={user["User-ID"]}>
              User {user["User-ID"]}
              {user.Location && ` - ${user.Location.split(",")[0]}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selected User Info */}
      {selectedUser && (
        <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
              U{selectedUser["User-ID"]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                User {selectedUser["User-ID"]}
              </Typography>
              <Chip
                label="Aktif"
                color="success"
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* User Details */}
          <Box sx={{ mt: 2 }}>
            {selectedUser.Age && (
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
              >
                <CakeIcon sx={{ mr: 1, fontSize: 16 }} />
                Umur: {selectedUser.Age}
              </Typography>
            )}
            {selectedUser.Location && (
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <LocationOnIcon sx={{ mr: 1, fontSize: 16 }} />
                {selectedUser.Location}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;

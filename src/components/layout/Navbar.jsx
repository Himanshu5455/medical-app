import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';

const Navbar = () => {
  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: '#ffffff', color: '#374151' }}>
      <div className="container mx-auto">
        <Toolbar className="flex justify-between px-0" sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MFC Logo" className="w-[40px] h-[40px]" />
            <Typography variant="h6" className="text-lg text-[#121417]">
              <span className="font-bold">MFC</span>
              <span className="font-medium"> . Triage assistant</span>
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Badge badgeContent={99} color="error">
              <NotificationsIcon className="text-gray-600" />
            </Badge>
            <Avatar alt="User" className="w-[40px] h-[40px] bg-blue-500">
              U
            </Avatar>
          </div>
        </Toolbar>
      </div>
    </AppBar>
  );
};

export default Navbar;

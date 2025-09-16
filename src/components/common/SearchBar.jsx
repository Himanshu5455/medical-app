import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const SearchBar = ({ value, onChange }) => {
  return (
    <TextField
      variant="outlined"
      placeholder="Search patients..."
      value={value}
      onChange={onChange}
      className="w-full md:w-80"
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon className="text-gray-400" />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;

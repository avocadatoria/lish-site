import { Controller } from 'react-hook-form';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

export default function WrappedMUIFileUpload({ 
  name, 
  control, 
  label, 
  rules, 
  multiple = false,
  accept,
  maxSize, // in bytes
  ...props 
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleFileChange = (e) => {
          const files = e.target.files;
          
          if (multiple) {
            onChange(Array.from(files));
          } else {
            onChange(files[0] || null);
          }
        };

        const handleRemove = (indexToRemove) => {
          if (multiple && Array.isArray(value)) {
            onChange(value.filter((_, index) => index !== indexToRemove));
          } else {
            onChange(null);
          }
        };

        const fileList = multiple && Array.isArray(value) ? value : (value ? [value] : []);

        return (
          <FormControl error={!!error} fullWidth {...props}>
            <Box sx={{ display: `flex`, flexDirection: `column`, gap: 1 }}>
              <Button
                component={`label`}
                variant={`outlined`}
                startIcon={<CloudUploadIcon />}
                sx={{ justifyContent: `flex-start` }}
              >
                {label || `Upload File${multiple ? `s` : ``}`}
                <input
                  type={`file`}
                  hidden
                  multiple={multiple}
                  accept={accept}
                  onChange={handleFileChange}
                />
              </Button>

              {fileList.length > 0 && (
                <Box sx={{ display: `flex`, flexDirection: `column`, gap: 1 }}>
                  {fileList.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                      onDelete={() => handleRemove(index)}
                      deleteIcon={<CloseIcon />}
                      variant={`outlined`}
                    />
                  ))}
                </Box>
              )}

              {error && <FormHelperText>{error.message}</FormHelperText>}
            </Box>
          </FormControl>
        );
      }}
    />
  );
}

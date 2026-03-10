import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function WrappedMUITabs({
  value,
  onChange,
  tabs, // Array of { label, content, icon?, disabled? }
  orientation = `horizontal`,
  variant = `standard`,
  ...props
}) {
  return (
    <Box>
      <Tabs
        value={value}
        onChange={onChange}
        orientation={orientation}
        variant={variant}
        sx={{
          borderBottom: orientation === `horizontal` ? 1 : 0,
          borderRight: orientation === `vertical` ? 1 : 0,
          borderColor: `divider`,
        }}
        {...props}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            disabled={tab.disabled}
            iconPosition={tab.iconPosition || `start`}
          />
        ))}
      </Tabs>
      <Box sx={{ p: 3 }}>
        {tabs[value]?.content}
      </Box>
    </Box>
  );
}

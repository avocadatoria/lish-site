import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function WrappedMUIAccordion({
  items, // Array of { title, content, defaultExpanded?, disabled? }
  enableTransitions = false,
  ...props
}) {
  const TransitionProps = enableTransitions ? undefined : { timeout: 0, unmountOnExit: false };
  
  return (
    <>
      {items.map((item, index) => (
        <Accordion
          key={index}
          defaultExpanded={item.defaultExpanded}
          disabled={item.disabled}
          TransitionProps={TransitionProps}
          disableGutters
          sx={{
            [`&:before`]: { display: `none` },
            ...(!enableTransitions && {
              [`& .MuiAccordion-region`]: {
                transition: `none !important`,
              },
            }),
          }}
          {...props}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              ...(!enableTransitions && {
                transition: `none !important`,
                [`& .MuiAccordionSummary-expandIconWrapper`]: {
                  transition: `none !important`,
                },
              }),
            }}
          >
            <Typography>{item.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {item.content}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

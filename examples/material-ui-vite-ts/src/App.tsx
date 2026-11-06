import * as React from 'react';
import { flushSync } from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Each click runs 60 synchronous re-renders, like 60 fast key repeats in a large form.
// React 19 throws "Maximum update depth exceeded" (#185) after 50 of them, because a
// same-value setState in a MUI effect leaves a default-priority update pending after every
// synchronous commit.
const BURST = 60;

function runBurst(rerender: () => void): string {
  let i = 0;
  try {
    for (; i < BURST; i += 1) {
      flushSync(rerender);
    }
    return `OK: ${BURST} synchronous re-renders`;
  } catch (error) {
    return `Crashed after ${i} re-renders: ${(error as Error).message}`;
  }
}

function Result({ text }: { text: string }) {
  return (
    <Typography
      data-testid="result"
      color={text.startsWith('OK') ? 'success' : 'error'}
      sx={{ mt: 1 }}
    >
      {text}
    </Typography>
  );
}

// InputBase calls `setAdornedStart(true)` whenever `startAdornment` is a new element.
function InputBaseDemo() {
  const [count, setCount] = React.useState(0);
  const [result, setResult] = React.useState('');

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">1. TextField with a startAdornment</Typography>
      <TextField
        label="Price"
        slotProps={{
          input: { startAdornment: <InputAdornment position="start">€</InputAdornment> },
        }}
        helperText={`Renders: ${count}`}
      />
      <Box sx={{ mt: 1 }}>
        <Button
          variant="contained"
          onClick={() => {
            setResult(runBurst(() => setCount((value) => value + 1)));
          }}
        >
          Click the field, then click here
        </Button>
      </Box>
      {result && <Result text={result} />}
    </Box>
  );
}

// Popper sets the Popper.js placement in state after every `forceUpdate()`.
function PopperDemo() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [placement, setPlacement] = React.useState<PopperPlacementType>('top');
  const [count, setCount] = React.useState(0);
  const [result, setResult] = React.useState('');

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">2. Open Popper</Typography>
      <Button
        ref={setAnchorEl}
        variant="contained"
        onClick={() => {
          // One real placement change, then re-renders that keep the same placement.
          flushSync(() => setPlacement((value) => (value === 'top' ? 'bottom' : 'top')));
          setResult(runBurst(() => setCount((value) => value + 1)));
        }}
      >
        Click here
      </Button>
      {result && <Result text={result} />}
      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement={placement}>
        <Paper sx={{ p: 1 }}>Renders: {count}</Paper>
      </Popper>
    </Box>
  );
}

// Control: the same burst without MUI components does not crash.
function ControlDemo() {
  const [count, setCount] = React.useState(0);
  const [result, setResult] = React.useState('');

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6">3. Control: no MUI component</Typography>
      <input aria-label="Plain input" defaultValue="" /> <span>Renders: {count}</span>
      <Box sx={{ mt: 1 }}>
        <button
          type="button"
          onClick={() => {
            setResult(runBurst(() => setCount((value) => value + 1)));
          }}
        >
          Click the input, then click here
        </button>
      </Box>
      {result && <Result text={result} />}
    </Box>
  );
}

export default function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h1">
          React 19: Maximum update depth exceeded
        </Typography>
        <InputBaseDemo />
        <Box sx={{ height: 80 }} />
        <PopperDemo />
        <ControlDemo />
      </Box>
    </Container>
  );
}

import { Snackbar, Alert } from "@mui/material";

function Error({ message, open, setOpen, setErrorMessage }) {
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => {
          setErrorMessage("");
          setOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Error;

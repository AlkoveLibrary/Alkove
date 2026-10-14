import {
  Alert,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useFormikContext } from "formik";
import { BookFormValues } from "types/book";

export const EditBookFields = ({
  hasCopies = false,
  lockIsbn = false,
  onDeleteClick,
}: {
  hasCopies?: boolean;
  lockIsbn?: boolean;
  onDeleteClick?: () => void;
}) => {
  const {
    values,
    handleChange,
    handleBlur,
    touched,
    errors,
    setFieldValue,
    setValues,
  } = useFormikContext<BookFormValues>();

  const handleNumericChange =
    (name: "edition_year" | "page_count" | "publication_year") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFieldValue(name, value === "" ? null : Number(value));
    };

  return (
    <>
      <Grid size={12}>
        <Grid
          container
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Book Details
          </Typography>
          {onDeleteClick && (
            <Tooltip
              title={
                hasCopies
                  ? "Remove all copies of this book before deleting it"
                  : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={hasCopies}
                  onClick={onDeleteClick}
                >
                  Delete Book
                </Button>
              </span>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      <Card variant="outlined" sx={{ p: 2, width: "100%" }}>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={12}>
            <TextField
              name={"isbn"}
              label={lockIsbn || values.no_isbn ? "ISBN" : "ISBN (required)"}
              value={values.isbn ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={lockIsbn || values.no_isbn}
              error={touched.isbn && !!errors.isbn}
              helperText={
                lockIsbn
                  ? "The ISBN cannot be changed after a book is created"
                  : touched.isbn && errors.isbn
              }
              variant="outlined"
              size="small"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: lockIsbn ? undefined : (
                    <InputAdornment position="end">
                      <FormControlLabel
                        sx={{ mr: 0, whiteSpace: "nowrap" }}
                        control={
                          <Checkbox
                            name="no_isbn"
                            size="small"
                            disabled={false}
                            checked={values.no_isbn ?? false}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              setValues({
                                ...values,
                                no_isbn: checked,
                                isbn: checked ? "" : values.isbn,
                              });
                            }}
                          />
                        }
                        label={<Typography variant="body2">No ISBN</Typography>}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {!lockIsbn && values.no_isbn && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Only use this for books published before 1970 or small
                self-published titles. Almost everything else has an ISBN -
                check the back cover and the inside of the title page before
                saving without one.
              </Alert>
            )}
          </Grid>

          <Grid size={12}>
            <TextField
              name={"title"}
              label={"Title (required)"}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <TextField
              name={"author"}
              label={"Author"}
              value={values.author}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.author && !!errors.author}
              helperText={touched.author && errors.author}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="edition"
              label="Edition Name"
              value={values.edition}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.edition && !!errors.edition}
              helperText={touched.edition && errors.edition}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="edition_year"
              label="Edition Year"
              type="number"
              value={values.edition_year ?? ""}
              onChange={handleNumericChange("edition_year")}
              onBlur={handleBlur}
              error={touched.edition_year && !!errors.edition_year}
              helperText={touched.edition_year && errors.edition_year}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="page_count"
              label="Number of Pages"
              type="number"
              value={values.page_count ?? ""}
              onChange={handleNumericChange("page_count")}
              onBlur={handleBlur}
              error={touched.page_count && !!errors.page_count}
              helperText={touched.page_count && errors.page_count}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="format"
              label="Physical Format"
              value={values.format}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.format && !!errors.format}
              helperText={touched.format && errors.format}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="publisher"
              label="Publisher(s)"
              value={values.publisher}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.publisher && !!errors.publisher}
              helperText={touched.publisher && errors.publisher}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="publication_year"
              label="First Publication Year"
              type="number"
              value={values.publication_year ?? ""}
              onChange={handleNumericChange("publication_year")}
              onBlur={handleBlur}
              error={touched.publication_year && !!errors.publication_year}
              helperText={touched.publication_year && errors.publication_year}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="genre"
              label="Genre"
              value={values.genre || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.genre && !!errors.genre}
              helperText={touched.genre && errors.genre}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              name="dewey_decimal"
              label="Dewey Decimal"
              value={values.dewey_decimal}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.dewey_decimal && !!errors.dewey_decimal}
              helperText={touched.dewey_decimal && errors.dewey_decimal}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>

          <Grid size={12}>
            <TextField
              name={"description"}
              label={"Description"}
              value={values.description || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              variant="outlined"
              size="small"
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
          <Grid size={12}>
            <Button
              variant="outlined"
              onClick={() => {
                handleChange({ target: { name: "description", value: "" } });
              }}
              color="error"
              size="small"
            >
              Clear Description{" "}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </>
  );
};

import React, { useRef } from "react";
import { Box, Button, Divider, Grid } from "@mui/material";
import { Formik, Form, FormikHelpers } from "formik";

import { createBookSchema, validateBookForm } from "schema/book";
import { BookFormValues, CreateBookParams, CreateCopyParams } from "types/book";
import CopiesSection from "components/create/CopiesSection";
import CoverForm from "./CoverForm";
import FormError from "components/FormError";
import { EditBookFields } from "components/EditBookFields";

interface CreateBookFormProps {
  initialValues: CreateBookParams;
  handleSubmit: (
    values: BookFormValues,
    formikHelpers: FormikHelpers<BookFormValues>,
    scanAgain?: boolean,
  ) => void | Promise<void>;
  openLibraryCoverId?: number;
}

export default function CreateBookForm({
  initialValues,
  handleSubmit,
  openLibraryCoverId,
}: CreateBookFormProps) {
  const scanAgainRef = useRef(false);
  return (
    <Formik<BookFormValues>
      initialValues={{ ...initialValues, no_isbn: false }}
      validationSchema={createBookSchema}
      validate={validateBookForm}
      onSubmit={(values, formikHelpers) => {
        const scanAgain = scanAgainRef.current;
        scanAgainRef.current = false;
        return handleSubmit(values, formikHelpers, scanAgain);
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => {
        const handleAddCopy = () => {
          setFieldValue("copies", [
            ...values.copies,
            { location: "", condition: "", notes: "" },
          ]);
        };
        const handleRemoveCopy = (index: number) => {
          setFieldValue(
            "copies",
            values.copies.filter(
              (_: CreateCopyParams, i: number) => i !== index,
            ),
          );
        };
        const handleDuplicateCopy = (index: number) => {
          const copyToDuplicate = values.copies[index];
          setFieldValue("copies", [
            ...values.copies.slice(0, index + 1),
            { ...copyToDuplicate },
            ...values.copies.slice(index + 1),
          ]);
        };
        const handleCopyChange = (
          index: number,
          field: keyof (typeof values.copies)[0],
          value: string,
        ) => {
          const newCopies = [...values.copies];
          newCopies[index] = { ...newCopies[index], [field]: value };
          setFieldValue("copies", newCopies);
        };
        return (
          <Form>
            <FormError />
            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 2, pb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  onClick={() => {
                    scanAgainRef.current = false;
                  }}
                  sx={{ flex: 1 }}
                >
                  {isSubmitting ? "Creating..." : "Create Book"}
                </Button>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={isSubmitting}
                  onClick={() => {
                    scanAgainRef.current = true;
                  }}
                  sx={{ flex: 1 }}
                >
                  Create & Scan Another
                </Button>
              </Box>
              <Divider />
            </Grid>
            <EditBookFields />
            <Grid size={12}>
              <CopiesSection
                copies={values.copies}
                onAddCopy={handleAddCopy}
                onRemoveCopy={handleRemoveCopy}
                onDuplicateCopy={handleDuplicateCopy}
                onCopyChange={handleCopyChange}
              />
            </Grid>

            <Grid size={12}>
              <CoverForm
                coverId={values.cover_id}
                handleSetCover={(coverId: string) =>
                  setFieldValue("cover_id", coverId)
                }
                openLibraryCoverId={openLibraryCoverId}
              />
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { BooksByPopularity } from "types/book";

interface BooksByPopularityTableProps {
  data: BooksByPopularity;
}

const columns: GridColDef[] = [
  { field: "title", headerName: "Book Name", flex: 1.5, minWidth: 200 },
  { field: "author", headerName: "Author", flex: 1, minWidth: 160 },
  {
    field: "count",
    headerName: "Times Checked Out",
    type: "number",
    width: 220,
  },
];

const BooksByPopularityTable: React.FC<BooksByPopularityTableProps> = ({
  data,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2 }}
        >
          Books By Popularity
        </Typography>
        <DataGrid
          autoHeight
          rows={data}
          columns={columns}
          getRowId={(row) => row.book_id}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
            sorting: { sortModel: [{ field: "count", sort: "desc" }] },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </CardContent>
    </Card>
  );
};

export default BooksByPopularityTable;

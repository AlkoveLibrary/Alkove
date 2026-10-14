import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { OTHER_COLOR } from "constants/colors";
import { TransactionsByAuthor } from "types/book";
import "components/chart/register";

interface TransactionsByAuthorChartProps {
  data: TransactionsByAuthor;
  authorColors: Map<string, string>;
}

const TransactionsByAuthorChart: React.FC<TransactionsByAuthorChartProps> = ({
  data,
  authorColors,
}) => {
  const theme = useTheme();
  const textColor = theme.palette.text.secondary;

  const colorFor = (author: string) =>
    author === "Other" ? OTHER_COLOR : authorColors.get(author);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{ color: theme.palette.secondary.main, fontWeight: 700, mb: 2 }}
        >
          Transactions By Author
        </Typography>
        <Box sx={{ height: 400 }}>
          <Pie
            data={{
              labels: data.map((entry) => entry.author),
              datasets: [
                {
                  data: data.map((entry) => entry.count),
                  backgroundColor: data.map((entry) => colorFor(entry.author)),
                  borderColor: theme.palette.background.paper,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "right",
                  labels: {
                    color: textColor,
                    generateLabels: () =>
                      data.map((entry, index) => ({
                        text: `${entry.author} - ${entry.count} (${entry.percentage}%)`,
                        fillStyle: colorFor(entry.author),
                        strokeStyle: colorFor(entry.author),
                        fontColor: textColor,
                        index,
                      })),
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const entry = data[context.dataIndex];
                      return `${entry.author}: ${entry.count} (${entry.percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionsByAuthorChart;

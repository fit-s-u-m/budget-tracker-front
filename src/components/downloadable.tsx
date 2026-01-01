import { useTransactions,useBalance } from "@/hook/useBudget";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 10 },
  subtitle: { fontSize: 12, marginBottom: 20, color: "#666" },

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  card: {
    width: "30%",
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 4
  },
  cardTitle: { fontSize: 10, color: "#555" },
  cardValue: { fontSize: 14, fontWeight: "bold" },

  tableHeader: {
    flexDirection: "row",
    borderBottom: 1,
    marginBottom: 5
  },
  row: {
    flexDirection: "row",
    marginBottom: 4
  },
  col: { width: "25%", fontSize: 10 }
});

export function DashboardPDF({
  balance,
  income,
  expense,
  transactions
}: {
  balance: number;
  income: number;
  expense: number;
  transactions: any[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Financial Dashboard</Text>
        <Text style={styles.subtitle}>
          Overview of your financial health
        </Text>

        {/* Summary */}
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Balance</Text>
            <Text style={styles.cardValue}>{balance} ETB</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Income</Text>
            <Text style={styles.cardValue}>{income} ETB</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Expenses</Text>
            <Text style={styles.cardValue}>{expense} ETB</Text>
          </View>
        </View>

        {/* Transactions */}
        <Text style={{ marginBottom: 6, fontSize: 12 }}>
          Recent Transactions
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.col}>Date</Text>
          <Text style={styles.col}>Category</Text>
          <Text style={styles.col}>Type</Text>
          <Text style={styles.col}>Amount</Text>
        </View>

        {transactions.slice(0, 10).map((t, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col}>{t.date}</Text>
            <Text style={styles.col}>{t.category}</Text>
            <Text style={styles.col}>{t.type}</Text>
            <Text style={styles.col}>{t.amount} ETB</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

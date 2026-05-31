import * as XLSX from 'xlsx';
import { getProducts, getCustomers, getBills, getReturns } from '../services/api';

export const exportAllData = async () => {
  try {
    const [productsRes, customersRes, billsRes, returnsRes] = await Promise.all([
      getProducts(),
      getCustomers(),
      getBills(),
      getReturns()
    ]);

    const wb = XLSX.utils.book_new();

    const wsProducts = XLSX.utils.json_to_sheet(productsRes?.data?.data || []);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Products");

    const wsCustomers = XLSX.utils.json_to_sheet(customersRes?.data?.data || []);
    XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");

    const wsBills = XLSX.utils.json_to_sheet(billsRes?.data?.data || []);
    XLSX.utils.book_append_sheet(wb, wsBills, "Bills");

    const wsReturns = XLSX.utils.json_to_sheet(returnsRes?.data?.data || []);
    XLSX.utils.book_append_sheet(wb, wsReturns, "Returns");

    XLSX.writeFile(wb, "Anyaa_Textiles_Export.xlsx");
    return true;
  } catch (error) {
    console.error("Export failed:", error);
    return false;
  }
};

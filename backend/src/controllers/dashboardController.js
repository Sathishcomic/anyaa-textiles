const db = require('../database/db');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Today's sales
    const todaySalesResult = await db.get(
      'SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ?',
      [today]
    );
    const todaySales = todaySalesResult.total;

    // Today's sales growth (compare with yesterday)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdaySalesResult = await db.get(
      'SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ?',
      [yesterday]
    );
    const yesterdaySales = yesterdaySalesResult.total;
    const todaySalesGrowth = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(2)
      : 0;

    // Total bills today
    const totalBillsResult = await db.get(
      'SELECT COUNT(*) as count FROM bills WHERE DATE(bill_date) = ?',
      [today]
    );
    const totalBills = totalBillsResult.count;

    // Total bills growth
    const yesterdayBillsResult = await db.get(
      'SELECT COUNT(*) as count FROM bills WHERE DATE(bill_date) = ?',
      [yesterday]
    );
    const yesterdayBills = yesterdayBillsResult.count;
    const totalBillsGrowth = yesterdayBills > 0
      ? ((totalBills - yesterdayBills) / yesterdayBills * 100).toFixed(2)
      : 0;

    // Cash sales today
    const cashSalesResult = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ? AND payment_method = 'Cash'",
      [today]
    );
    const cashSales = cashSalesResult.total;

    // Cash sales growth
    const yesterdayCashSalesResult = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ? AND payment_method = 'Cash'",
      [yesterday]
    );
    const yesterdayCashSales = yesterdayCashSalesResult.total;
    const cashSalesGrowth = yesterdayCashSales > 0
      ? ((cashSales - yesterdayCashSales) / yesterdayCashSales * 100).toFixed(2)
      : 0;

    // UPI sales today
    const upiSalesResult = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ? AND payment_method = 'UPI'",
      [today]
    );
    const upiSales = upiSalesResult.total;

    // UPI sales growth
    const yesterdayUpiSalesResult = await db.get(
      "SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ? AND payment_method = 'UPI'",
      [yesterday]
    );
    const yesterdayUpiSales = yesterdayUpiSalesResult.total;
    const upiSalesGrowth = yesterdayUpiSales > 0
      ? ((upiSales - yesterdayUpiSales) / yesterdayUpiSales * 100).toFixed(2)
      : 0;

    // Stock items count
    const stockItemsResult = await db.get('SELECT COUNT(*) as count FROM products');
    const stockItems = stockItemsResult.count;

    // Low stock alerts
    const lowStockAlertsResult = await db.get(
      'SELECT COUNT(*) as count FROM products WHERE stock < min_stock'
    );
    const lowStockAlerts = lowStockAlertsResult.count;

    // Weekly sales data
    const weeklySales = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let weekTotal = 0;
    let lastWeekTotal = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      const salesResult = await db.get(
        'SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ?',
        [dateStr]
      );
      const sales = salesResult.total;

      weeklySales.push({
        name: dayName,
        sales: sales
      });
      weekTotal += sales;

      // Last week same day
      const lastWeekDate = new Date(Date.now() - (i + 7) * 86400000);
      const lastWeekDateStr = lastWeekDate.toISOString().split('T')[0];
      const lastWeekSalesResult = await db.get(
        'SELECT COALESCE(SUM(total), 0) as total FROM bills WHERE DATE(bill_date) = ?',
        [lastWeekDateStr]
      );
      lastWeekTotal += lastWeekSalesResult.total;
    }

    const growth = lastWeekTotal > 0
      ? ((weekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        todaySales,
        todaySalesGrowth: parseFloat(todaySalesGrowth),
        totalBills,
        totalBillsGrowth: parseFloat(totalBillsGrowth),
        cashSales,
        cashSalesGrowth: parseFloat(cashSalesGrowth),
        upiSales,
        upiSalesGrowth: parseFloat(upiSalesGrowth),
        stockItems,
        lowStockAlerts,
        weeklySales,
        weekTotal,
        lastWeekTotal,
        growth: parseFloat(growth)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};

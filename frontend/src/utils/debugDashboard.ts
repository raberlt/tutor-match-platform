// Utility để debug localStorage dashboard data
export const debugDashboard = {
  // Xem cached dashboard stats
  viewCachedStats: () => {
    console.group("📊 Cached Dashboard Stats:");
    const cached = localStorage.getItem("dashboard_stats_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("Raw data:", cached);
        console.log("Parsed data:", parsed);
        console.table(parsed);
      } catch (error) {
        console.error("❌ Error parsing cached stats:", error);
      }
    } else {
      console.log("❌ No cached dashboard stats found");
    }
    console.groupEnd();
  },

  // Xem tất cả localStorage keys
  listAllKeys: () => {
    console.group("🔍 All localStorage keys:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${i + 1}. ${key}`);
    }
    console.groupEnd();
  },

  // Xóa cached dashboard stats
  clearCachedStats: () => {
    localStorage.removeItem("dashboard_stats_cache");
    console.log("✅ Cached dashboard stats cleared");
  },

  // Xóa tất cả localStorage
  clearAll: () => {
    if (confirm("Bạn có chắc muốn xóa tất cả localStorage?")) {
      localStorage.clear();
      console.log("✅ All localStorage cleared");
    }
  },
};

// Thêm vào window object để dễ truy cập từ console
if (typeof window !== "undefined") {
  (window as any).debugDashboard = debugDashboard;
}


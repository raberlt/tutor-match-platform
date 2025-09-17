// Tutor Search with Pagination JavaScript
class TutorSearchPagination {
  constructor() {
    this.currentPage = 0;
    this.totalPages = 0;
    this.pageSize = 20;
    this.totalElements = 0;
    this.currentFilters = {};
    this.currentSort = "id,asc";
    this.isAuthenticated = false;
    this.initializeSearch();
  }

  initializeSearch() {
    // Check authentication status
    this.checkAuthStatus();

    // Load initial data
    this.loadTutors();

    // Setup event listeners
    this.setupEventListeners();

    // Listen for auth changes
    this.setupAuthListener();
  }

  setupAuthListener() {
    // Listen for storage changes (when auth state changes)
    window.addEventListener("storage", (e) => {
      if (e.key === "jwt_token" || e.key === "user_info") {
        console.log("Auth state changed, reloading...");
        this.checkAuthStatus();
        this.loadTutors(); // Reload tutors with new auth state
      }
    });

    // Also check auth every 30 seconds
    setInterval(() => {
      const wasAuth = this.isAuthenticated;
      this.checkAuthStatus();
      if (wasAuth !== this.isAuthenticated) {
        console.log("Auth status changed, reloading tutors...");
        this.loadTutors();
      }
    }, 30000);
  }

  checkAuthStatus() {
    // Check if user is logged in by looking for JWT token
    const token =
      localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token");
    this.isAuthenticated = !!token;

    // Additional check using window.authManager if available
    if (
      window.authManager &&
      typeof window.authManager.isAuthenticated === "function"
    ) {
      this.isAuthenticated = window.authManager.isAuthenticated();
    }
  }

  setupEventListeners() {
    // Filter form submission
    const filterForm = document.getElementById("filterForm");
    if (filterForm) {
      filterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFilterSubmit();
      });
    }

    // Sort change
    const sortSelect = document.getElementById("sortBy");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentSort = e.target.value;
        this.currentPage = 0; // Reset to first page
        this.loadTutors();
      });
    }

    // Clear filters
    const clearBtn = document.getElementById("clearFilters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearFilters();
      });
    }
  }

  handleFilterSubmit() {
    // Get filter values
    const keyword = document.getElementById("keyword")?.value || "";
    const subjectId = document.getElementById("subjectId")?.value || "";
    const minFee = document.getElementById("minFee")?.value || "";
    const maxFee = document.getElementById("maxFee")?.value || "";
    const minRating = document.getElementById("minRating")?.value || "";
    const city = document.getElementById("city")?.value || "";

    this.currentFilters = {
      keyword: keyword.trim(),
      subjectId: subjectId || null,
      minFee: minFee || null,
      maxFee: maxFee || null,
      minRating: minRating || null,
      city: city.trim() || null,
    };

    this.currentPage = 0; // Reset to first page
    this.loadTutors();
  }

  clearFilters() {
    // Clear form inputs
    document.getElementById("keyword").value = "";
    document.getElementById("subjectId").value = "";
    document.getElementById("minFee").value = "";
    document.getElementById("maxFee").value = "";
    document.getElementById("minRating").value = "";
    document.getElementById("city").value = "";

    this.currentFilters = {};
    this.currentPage = 0;
    this.loadTutors();
  }

  async loadTutors() {
    try {
      // Show loading
      this.showLoading();

      // Build API URL
      const apiUrl = this.isAuthenticated
        ? "/api/tutors"
        : "/api/public/tutors";
      const url = new URL(apiUrl, window.location.origin);

      // Add pagination params
      url.searchParams.append("page", this.currentPage);
      url.searchParams.append("size", this.pageSize);

      // Add sort params
      const [sortBy, sortDirection] = this.currentSort.split(",");
      url.searchParams.append("sortBy", sortBy);
      url.searchParams.append("sortDirection", sortDirection);

      // Add filter params
      Object.entries(this.currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          url.searchParams.append(key, value);
        }
      });

      // Make API call
      const headers = {};
      if (this.isAuthenticated) {
        const token =
          localStorage.getItem("jwt_token") ||
          sessionStorage.getItem("jwt_token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update pagination info
      this.totalElements = data.totalElements || 0;
      this.totalPages = data.totalPages || 0;
      this.currentPage = data.currentPage || 0;

      // Render tutors
      this.renderTutors(data.tutors || []);

      // Render pagination
      this.renderPagination();

      // Update tutor count
      this.updateTutorCount();
    } catch (error) {
      console.error("Error loading tutors:", error);
      this.showError(
        "Có lỗi xảy ra khi tải danh sách gia sư. Vui lòng thử lại."
      );
    }
  }

  renderTutors(tutors) {
    const container = document.getElementById("tutorsContainer");
    if (!container) return;

    if (tutors.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Không tìm thấy gia sư nào</h4>
                    <p class="text-muted">Hãy thử thay đổi bộ lọc để tìm kiếm gia sư khác.</p>
                </div>
            `;
      return;
    }

    const tutorHtml = tutors
      .map((tutor) => this.createTutorCard(tutor))
      .join("");
    container.innerHTML = tutorHtml;

    // Hide static tutors if they exist
    const staticTutors = document.getElementById("staticTutors");
    if (staticTutors) {
      staticTutors.style.display = "none";
    }
  }

  createTutorCard(tutor) {
    const isPreview = !this.isAuthenticated;
    const subjects = isPreview
      ? (tutor.subjectNames || []).join(", ")
      : (tutor.subjects || []).map((s) => s.name).join(", ");

    const ratingStars = this.createRatingStars(tutor.ratePointAverage || 0);
    const avatarUrl =
      tutor.imageAvatar || "https://via.placeholder.com/120x120?text=User";

    return `
            <div class="tutor-card">
                <div class="row align-items-center">
                    <!-- Avatar -->
                    <div class="col-md-3 text-center">
                        <img src="${avatarUrl}" class="tutor-avatar" alt="${
      tutor.firstName
    } ${tutor.lastName}" />
                    </div>

                    <!-- Info -->
                    <div class="col-md-6">
                        <h4 class="tutor-name">${tutor.firstName} ${
      tutor.lastName
    }</h4>
                        ${
                          tutor.headline
                            ? `<p class="tutor-headline">${tutor.headline}</p>`
                            : ""
                        }
                        
                        <div class="tutor-subjects mb-2">
                            <strong>Môn học:</strong> ${subjects}
                        </div>

                        <div class="tutor-rating mb-2">
                            ${ratingStars}
                            <span class="ms-2">(${
                              tutor.totalPoint || 0
                            } đánh giá)</span>
                        </div>

                        ${
                          tutor.bio && !isPreview
                            ? `<p class="tutor-bio">${tutor.bio}</p>`
                            : ""
                        }
                    </div>

                    <!-- Actions -->
                    <div class="col-md-3 text-center">
                        <div class="tutor-fee mb-3">
                            <strong>${(tutor.fees || 0).toLocaleString(
                              "vi-VN"
                            )} VNĐ/giờ</strong>
                        </div>
                        
                        ${
                          this.isAuthenticated
                            ? `
                            <button class="btn btn-primary btn-book mb-2" onclick="bookTutor(${tutor.id})" style="width: 100%;">
                                <i class="fas fa-calendar-plus"></i> Đặt lịch học thử
                            </button>
                            <button class="btn btn-outline-primary btn-detail" onclick="viewTutorDetail(${tutor.id})" style="width: 100%;">
                                <i class="fas fa-eye"></i> Xem chi tiết
                            </button>
                        `
                            : `
                            <p class="text-muted small mb-2">
                                <i class="fas fa-lock"></i> 
                                Đăng nhập để đặt lịch học
                            </p>
                            <a href="/showLogin" class="btn btn-outline-primary" style="width: 100%;">
                                <i class="fas fa-sign-in-alt"></i> Đăng nhập
                            </a>
                        `
                        }
                    </div>
                </div>
            </div>
        `;
  }

  createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = "";

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star text-warning"></i>';
    }

    if (hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="far fa-star text-warning"></i>';
    }

    return `<span class="tutor-rating-stars">${starsHtml}</span>`;
  }

  renderPagination() {
    const paginationContainer = document.getElementById("paginationContainer");
    const pagination = document.getElementById("pagination");

    if (!pagination || this.totalPages <= 1) {
      if (paginationContainer) {
        paginationContainer.style.display = "none";
      }
      return;
    }

    let paginationHtml = "";

    // Previous button
    paginationHtml += `
            <li class="page-item ${this.currentPage === 0 ? "disabled" : ""}">
                <a class="page-link" href="#" onclick="tutorSearch.goToPage(${
                  this.currentPage - 1
                })" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

    // Page numbers
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);

    if (startPage > 0) {
      paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="tutorSearch.goToPage(0)">1</a>
                </li>
            `;
      if (startPage > 1) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
                <li class="page-item ${i === this.currentPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="tutorSearch.goToPage(${i})">${
        i + 1
      }</a>
                </li>
            `;
    }

    if (endPage < this.totalPages - 1) {
      if (endPage < this.totalPages - 2) {
        paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="tutorSearch.goToPage(${
                      this.totalPages - 1
                    })">${this.totalPages}</a>
                </li>
            `;
    }

    // Next button
    paginationHtml += `
            <li class="page-item ${
              this.currentPage === this.totalPages - 1 ? "disabled" : ""
            }">
                <a class="page-link" href="#" onclick="tutorSearch.goToPage(${
                  this.currentPage + 1
                })" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;

    pagination.innerHTML = paginationHtml;
    paginationContainer.style.display = "flex";
  }

  goToPage(page) {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadTutors();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateTutorCount() {
    const countElement = document.getElementById("tutorCount");
    if (!countElement) return;

    if (this.totalElements === 0) {
      countElement.textContent = "Không tìm thấy gia sư nào";
    } else {
      const start = this.currentPage * this.pageSize + 1;
      const end = Math.min(
        (this.currentPage + 1) * this.pageSize,
        this.totalElements
      );
      countElement.textContent = `Hiển thị ${start}-${end} trong tổng số ${this.totalElements} gia sư`;
    }
  }

  showLoading() {
    const container = document.getElementById("tutorsContainer");
    if (!container) return;

    container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
                <p class="mt-3">Đang tìm kiếm gia sư...</p>
            </div>
        `;
  }

  showError(message) {
    const container = document.getElementById("tutorsContainer");
    if (!container) return;

    container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Có lỗi xảy ra</h5>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="tutorSearch.loadTutors()">
                    <i class="fas fa-redo"></i> Thử lại
                </button>
            </div>
        `;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.tutorSearch = new TutorSearchPagination();
});

// Global functions for tutor actions (to be used by existing code)
function bookTutor(tutorId) {
  console.log("Book tutor:", tutorId);

  // Check authentication first
  const token =
    localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token");
  if (!token) {
    alert("Vui lòng đăng nhập để đặt lịch học");
    window.location.href = "/showLogin";
    return;
  }

  // Redirect to booking form
  window.location.href = `/booking-form?tutorId=${tutorId}`;
}

function viewTutorDetail(tutorId) {
  console.log("View tutor detail:", tutorId);

  // Check authentication first
  const token =
    localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token");
  if (!token) {
    alert("Vui lòng đăng nhập để xem chi tiết gia sư");
    window.location.href = "/showLogin";
    return;
  }

  // For now, redirect to booking form since we don't have detail page yet
  // TODO: Create tutor detail page later
  window.location.href = `/booking-form?tutorId=${tutorId}`;
}

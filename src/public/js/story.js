function logout() {
  fetch("/logout", {
    method: "POST",
  })
    .then((res) => res.text())
    .then((data) => {
      localStorage.clear();
      window.location.href = "/login";
    });
}

function nextPage() {
  window.location.href = "/?story=" + (parseInt(new URLSearchParams(window.location.search).get("story") ?? 1) + 1);
}

document.getElementById("user").innerText =
  "Xin chào, " + localStorage.getItem("username");

document.getElementById("info").innerText =
  "Bạn đang sử dụng trình duyệt " +
  (localStorage.getItem("browser") ?? "không xác định") +
  " phiên bản " +
  (localStorage.getItem("version") ?? "không xác định");

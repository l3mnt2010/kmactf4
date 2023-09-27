// Helper function to add or remove classes from an element
function toggleClass(element, className, condition) {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

// Select all elements with the 'form' class
let formElements = document.querySelectorAll(".form input, .form textarea");

// Add event listeners for 'keyup', 'blur', and 'focus'
formElements.forEach(function (element) {
  element.addEventListener("keyup", function (e) {
    let label = element.previousElementSibling;
    toggleClass(label, "active", element.value !== "");
    toggleClass(label, "highlight", element.value !== "");
  });

  element.addEventListener("blur", function (e) {
    let label = element.previousElementSibling;
    toggleClass(label, "active", element.value !== "");
    toggleClass(label, "highlight", false);
  });

  element.addEventListener("focus", function (e) {
    let label = element.previousElementSibling;
    toggleClass(label, "highlight", element.value !== "");
  });
});

// Select all elements with the 'tab' class
let tabLinks = document.querySelectorAll(".tab a");

// Add click event listeners to the tab links
tabLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    let parent = link.parentNode;
    parent.classList.add("active");

    let siblings = Array.from(parent.parentNode.children).filter(function (el) {
      return el !== parent;
    });

    siblings.forEach(function (sibling) {
      sibling.classList.remove("active");
    });

    let target = link.getAttribute("href");
    let tabContent = document.querySelectorAll(".tab-content > div");

    tabContent.forEach(function (content) {
      if (content.id === target.slice(1)) {
        content.style.display = "block";
      } else {
        content.style.display = "none";
      }
    });
  });
});

let formRegister = document.getElementById("register");
formRegister.addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("registerError").innerText = "";

  let nAgt = navigator.userAgent;
  let browserName = navigator.appName;
  let fullVersion = "" + parseFloat(navigator.appVersion);

  // In Opera, the true version is after "OPR" or after "Version"
  if ((verOffset = nAgt.indexOf("OPR")) != -1) {
    browserName = "Opera";
    fullVersion = nAgt.substring(verOffset + 4);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In MS Edge, the true version is after "Edg" in userAgent
  else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
    browserName = "Microsoft Edge";
    fullVersion = nAgt.substring(verOffset + 4);
  }
  // In MSIE, the true version is after "MSIE" in userAgent
  else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browserName = "Microsoft Internet Explorer";
    fullVersion = nAgt.substring(verOffset + 5);
  }
  // In Chrome, the true version is after "Chrome"
  else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browserName = "Chrome";
    fullVersion = nAgt.substring(verOffset + 7);
  }
  // In Safari, the true version is after "Safari" or after "Version"
  else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browserName = "Safari";
    fullVersion = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1)
      fullVersion = nAgt.substring(verOffset + 8);
  }
  // In Firefox, the true version is after "Firefox"
  else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browserName = "Firefox";
    fullVersion = nAgt.substring(verOffset + 8);
  }
  // In most other browsers, "name/version" is at the end of userAgent
  else if (
    (nameOffset = nAgt.lastIndexOf(" ") + 1) <
    (verOffset = nAgt.lastIndexOf("/"))
  ) {
    browserName = nAgt.substring(nameOffset, verOffset);
    fullVersion = nAgt.substring(verOffset + 1);
    if (browserName.toLowerCase() == browserName.toUpperCase()) {
      browserName = navigator.appName;
    }
  }
  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(";")) != -1)
    fullVersion = fullVersion.substring(0, ix);
  if ((ix = fullVersion.indexOf(" ")) != -1)
    fullVersion = fullVersion.substring(0, ix);

  majorVersion = parseInt("" + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  let data = new FormData(event.target);
  let value = Object.fromEntries(data.entries());
  value.info = {
    browser: browserName,
    version: fullVersion
  };
  
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.ok) {
        document.getElementById("registerError").style.color = "#90EE90";
      } else {
        document.getElementById("registerError").style.color = "red";
      }
      document.getElementById("registerError").innerText = data?.message;
    });
});

let formLogin = document.getElementById("login");
formLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("loginError").innerText = "";

  let data = new FormData(event.target);
  let value = JSON.stringify(Object.fromEntries(data.entries()));
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: value,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.ok) {
        localStorage.setItem("username", data?.data?.username);
        localStorage.setItem("browser", data?.data?.info?.browser);
        localStorage.setItem("version", data?.data?.info?.version);
        document.getElementById("loginError").style.color = "#90EE90";
        window.location.href = "/?story=1";
      } else {
        document.getElementById("loginError").style.color = "red";
      }
      document.getElementById("loginError").innerText = data?.message;
    });
});

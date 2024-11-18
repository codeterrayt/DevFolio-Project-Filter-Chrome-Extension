let allProjectsData = []; // To store all fetched projects across multiple fetches

document.addEventListener("DOMContentLoaded", async () => {
  // Get the current tab URL and set the subdomain field
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  let subdomain = url.hostname.split(".")[0];
  document.getElementById("subdomain").value = subdomain; // Set the value in the 'subdomain' input field

  // Load previously saved data (if any) from localStorage
  loadProjectsFromStorage();
});

document.getElementById("fetch").addEventListener("click", async () => {
  const subdomain = document.getElementById("subdomain").value.trim();
  const filter = document.getElementById("filter").value;

  if (!subdomain) {
    alert("Please enter a subdomain.");
    return;
  }

  // Clear old data from DOM and localStorage before fetching new data
  clearOldData();

  document.getElementById("results").style.opacity = '0';
  document.getElementById("loading").style.display = 'block';

  // Fetch new projects and update the display
  const newProjects = await fetchProjects(subdomain);
  allProjectsData = newProjects; // Replace the old projects with the new ones

  document.getElementById("results").style.opacity = '1';
  document.getElementById("loading").style.display = 'none';

  // Save the new data to localStorage
  saveProjectsToStorage(allProjectsData);

  // Display the updated list of projects
  displayProjects(allProjectsData, filter);
});

async function fetchProjects(subdomain) {
  try {
    const initialResponse = await fetch(
      "https://api.devfolio.co/api/search/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          hackathon_slugs: [subdomain],
          q: "",
          filter: "all",
          from: 1,
          size: 1, // Fetch all projects
        }),
      }
    );

    const initialData = await initialResponse.json();
    const totalProjects = initialData.hits.total.value; // Get total number of projects

    // Fetch all projects in batches without duplicates
    const allProjects = new Set();
    const response = await fetch(
      "https://api.devfolio.co/api/search/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          hackathon_slugs: [subdomain],
          q: "",
          filter: "all",
          from: 2,
          size: totalProjects, // Fetch all projects
        }),
      }
    );

    const data = await response.json();
    data.hits.hits.forEach((project) => {
      allProjects.add(project); // Add project to the set to ensure no duplicates
    });

    return Array.from(allProjects).map((project) => ({
      name: project._source.name,
      likes: project._source.likes,
      views: project._source.views,
      slug: project._source.slug,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

function openProjectTab(slug) {
  const url = `https://devfolio.co/projects/${slug}`;
  chrome.tabs.create({ url: url, active: true });
}

function displayProjects(data, filter) {
  const tbody = document.getElementById("results");

  // Clear the table before displaying new data
  tbody.innerHTML = "<tr><th>#</th><th>Project Name</th><th>Likes</th><th>Views</th><th></th></tr>";

  const [key, order] = filter.split("_");
  const sortedData = data.sort((a, b) => {
    return order === "desc" ? b[key] - a[key] : a[key] - b[key];
  });

  if (sortedData.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.textContent = "No projects found";
    cell.setAttribute("colspan", "5"); // Correctly set colspan attribute
    row.appendChild(cell);
    tbody.appendChild(row);
    return; // Exit early if no projects found
  } 

  let count = 1;

  sortedData.forEach((project) => {
    const row = document.createElement("tr");

    // Add the data to the row
    const cell1 = document.createElement("td");
    cell1.textContent = count;
    row.appendChild(cell1);

    const cell2 = document.createElement("td");
    cell2.textContent = project.name || "NA";
    row.appendChild(cell2);

    const cell3 = document.createElement("td");
    cell3.textContent = project.likes || 0;
    row.appendChild(cell3);

    const cell4 = document.createElement("td");
    cell4.textContent = project.views || 0;
    row.appendChild(cell4);

    const cell5 = document.createElement("td");

    // Create the View Project button
    const button = document.createElement("button");
    button.textContent = "View Project";

    // Add event listener for the button
    button.addEventListener("click", () => {
      openProjectTab(project.slug); // Open the project in a new tab when clicked
    });

    cell5.appendChild(button);
    row.appendChild(cell5);

    // Append the row to the table body
    tbody.appendChild(row);
    count++;
  });
}


document.addEventListener("keyup",()=>{
    const searchInput = document.getElementById("search").value.toLowerCase();
//   alert(searchInput);
  const rows = document.getElementById("results").rows;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const projectName = row.cells[1].textContent.toLowerCase();
    const projectViews = row.cells[2].textContent.toLowerCase();
    const projectLikes = row.cells[3].textContent.toLowerCase();
    if (projectName.includes(searchInput) || projectViews.includes(searchInput) || projectLikes.includes(searchInput)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
})

// Function to save projects to localStorage
function saveProjectsToStorage(projects) {
  chrome.storage.local.set({ allProjects: projects }, function () {
    console.log("Projects saved to localStorage.");
  });
}

// Function to load projects from localStorage
function loadProjectsFromStorage() {
  chrome.storage.local.get("allProjects", function (data) {
    if (data.allProjects) {
      allProjectsData = data.allProjects;
      displayProjects(allProjectsData, "views_desc"); // Default sort order
    }
  });
}

// Function to clear old data from the DOM and localStorage
function clearOldData() {
  // Clear the data from localStorage
  chrome.storage.local.remove("allProjects", function () {
    console.log("Old projects cleared from localStorage.");
  });

  // Clear the data from the DOM (i.e., the table)
  const tbody = document.getElementById("results");
  tbody.innerHTML = "<tr><th>#</th><th>Project Name</th><th>Likes</th><th>Views</th><th></th></tr>";
}

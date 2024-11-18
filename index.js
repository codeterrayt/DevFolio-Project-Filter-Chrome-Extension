async function fetchProjects(hackathon_subdomain) {
    // Initial fetch to get the total number of projects
    const initialResponse = await fetch("https://api.devfolio.co/api/search/projects", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://sdfsege4t43ger.devfolio.co/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            hackathon_slugs: [hackathon_subdomain],
            q: "",
            filter: "all",
            prizes: [],
            prize_tracks: [],
            hashtags: [],
            tracks: [],
            category: [],
            from: 1,
            size: 1 // Fetch all projects
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const initialData = await initialResponse.json();
    const totalProjects = initialData.hits.total.value; // Get total number of projects

    // Fetch all projects in batches without duplicates
    const allProjects = new Set();
    const response = await fetch("https://api.devfolio.co/api/search/projects", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://sdrfsr23refs.devfolio.co/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            hackathon_slugs: ["mumbaihacks"],
            q: "",
            filter: "all",
            prizes: [],
            prize_tracks: [],
            hashtags: [],
            tracks: [],
            category: [],
            from: 2,
            size: totalProjects // Fetch all projects
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    const data = await response.json();
    data.hits.hits.forEach(project => {
        allProjects.add(project); // Add project to the set to ensure no duplicates
    });

    return Array.from(allProjects); // Return the complete list of projects without duplicates
}

async function filterProjects(data, filterOptions) {
    const { likesOrder, viewsOrder } = filterOptions;

    let filteredProjects = data;

    if (likesOrder) {
        filteredProjects = filteredProjects.sort((a, b) => {
            return likesOrder === 'asc' ? a._source.likes - b._source.likes : likesOrder === 'desc' ? b._source.likes - a._source.likes : 0;
        });
    }

    if (viewsOrder) {
        filteredProjects = filteredProjects.sort((a, b) => {
            return viewsOrder === 'asc' ? a._source.views - b._source.views : viewsOrder === 'desc' ? b._source.views - a._source.views : 0;
        });
    }

    console.log(filteredProjects);
}

fetchProjects("agnethonfcrit").then(data => {
    const filterOptions = {
        viewsOrder: 'desc' 
    };

    filterProjects(data, filterOptions);
});
const addTaskForm = document.getElementById("addTaskForm");

if (addTaskForm) {
  addTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      task_name: document.querySelector("#task_name").value,
      category: document.querySelector("#category").value,
      task_type: document.querySelector("#task_type").value,
      description: document.querySelector("#description").value,
      reminder_time: document.querySelector("#reminder_time").value,
    };

    let AccessToken = localStorage.getItem("AccessToken");
    let RefreshToken = localStorage.getItem("RefreshToken");

    if (!AccessToken || !RefreshToken) {
      return (window.location.href = "/index.html");
    }

    try {
      let response = await fetch("/add-Task", {
        method: "POST",
        headers: {
          authorization: `Bearer ${AccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result = await response.json();

      // Check for token expiration status codes or specific messages
      if (
        response.status === 401 ||
        result.expired ||
        result.message === "ACCESS_TOKEN_EXPIRED" ||
        result.message === "jwt expired"
      ) {
        console.log("Access token expired. Requesting a fresh token...");

        const refreshResponse = await fetch("/refresh", {
          method: "POST",
          headers: {
            authorization: `Bearer ${RefreshToken}`,
            "Content-Type": "application/json",
          },
        });

        const refreshResult = await refreshResponse.json();

        if (!refreshResult.success) {
          console.log("Refresh token failed:", refreshResult.message);
          alert("Your session has expired. Please log in again.");

          localStorage.removeItem("AccessToken");
          localStorage.removeItem("RefreshToken");
          return (window.location.href = "/index.html");
        }

        // Save new token and retry the task creation request
        AccessToken = refreshResult.newAccessToken;
        localStorage.setItem("AccessToken", AccessToken);

        response = await fetch("/add-Task", {
          method: "POST",
          headers: {
            authorization: `Bearer ${AccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        result = await response.json();
      }

      console.log(result.message);
      alert(result.message);

      if (response.status === 201) {
        addTaskForm.reset();
      }
    } catch (error) {
      console.error("An error occurred during submission:", error.message);
    }
  });
}

const searchForm = document.getElementById("search-group");
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault(); 
  const output =document.getElementById("taskList");

const clickedButton = e.submitter.value;


  if (clickedButton === "search") {
    const data = {
      searchType: document.getElementById("searchType").value,
      searchValue: document.getElementById("searchValue").value,
    };
    if (!data.searchValue || !data.searchType) {
      return alert("please fill the required  information");
    }

    let AccessToken = localStorage.getItem("AccessToken");
    let RefreshToken = localStorage.getItem("RefreshToken");

    let response = await fetch(
      `/search?searchType=${encodeURIComponent(data.searchType)}&searchValue=${encodeURIComponent(data.searchValue)}`,
      { method: "GET", headers: { authorization: `Bearer ${AccessToken}` } },
    );
    let result = await response.json();
    if (!result.success || result.expired) {
      console.log(result.message);
      const RefreshToken_response = await fetch("/refresh", {
        method: "POST",
        headers: { authorization: `Bearer ${RefreshToken}` },
      });

      const newtoken = await RefreshToken_response.json();
      if (!newtoken.success) {
        alert(newtoken.message);
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("RefreshToken");
        return (window.location.href = "/index.html");
      }
      AccessToken = newtoken.newAccessToken;
      localStorage.setItem("AccessToken", AccessToken);

      response = await fetch( 
        `/search?searchType=${encodeURIComponent(data.searchType)}&searchValue=${encodeURIComponent(data.searchValue)}`,
        { method: "GET", headers: { authorization: `Bearer ${AccessToken}` } },
      );

      result = await response.json();
    }
      
    if (!result.success) {
    return alert(result.message);
    }

    
    output.innerHTML = `
  <table class="task-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Task Name</th>
        <th>Category</th>
        <th>Task Type</th>
        <th>Description</th>
        <th>Reminder Time</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${result.data.map((task) => {
        // Convert the date explicitly to a string so it doesn't break the template literal
        const displayDate = task.reminder_time ? String(task.reminder_time) : "No Date";
        
        return `
          <tr>
            <td>${task.id || ""}</td>
            <td>${task.task_name || ""}</td>
            <td>${task.category || ""}</td>
            <td>${task.task_type || ""}</td>
            <td>${task.description || ""}</td>
            <td>${displayDate}</td>
            <td>${task.status || ""}</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>
`;
  } if (clickedButton === "reset") {
     output.innerHTML=``;    
  }
});


const POST_VIDEO_URL =
  "https://prod-13.uksouth.logic.azure.com:443/workflows/03138b0b809547dda89b75fc40b49fa5/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=7Um6X7_-j0Y1Ve4rjXt06shPYLZimqhdAmGOM5SBnH4";


const GET_ALL_VIDEOS_URL =
  "https://prod-47.uksouth.logic.azure.com:443/workflows/0de1cca3acd94a10a3f812c1efbf9e61/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=NITXik5R5i7IUmBV0-rkYE8n1uxi2pHBwNQ8WwqnscY";

const GET_ONE_BASE =
  "https://prod-05.uksouth.logic.azure.com/workflows/e50b190dd43b4126959059b845e72642/triggers/When_an_HTTP_request_is_received/paths/invoke/videos/";
const GET_ONE_SUFFIX =
  "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=Jsi1TPPAD40MCHUNutTPimz0yOcjCIIGSFMR3wTBeXY";

const PUT_BASE =
  "https://prod-24.uksouth.logic.azure.com/workflows/d466acfc487d40c89f782610a941f681/triggers/When_an_HTTP_request_is_received/paths/invoke/videos/";
const PUT_SUFFIX =
  "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=kyLDAModEw3eQUwVp6k3Q8VZn84ajCgExztWnjxTYqY";

const DELETE_BASE =
  "https://prod-01.uksouth.logic.azure.com/workflows/82ae6ac69bbd449eab03e42284ee3426/triggers/When_an_HTTP_request_is_received/paths/invoke/videos/";
const DELETE_SUFFIX =
  "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=RPaqRJBNUtHkQbtYx21TmtrZ-92JkJfNyEJ90R0HpzY";


 
const POST_COMMENT_URL =
  "https://prod-16.uksouth.logic.azure.com:443/workflows/f36042ad64a54fb49ec8cfd89663bf08/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=dJW3Etxresnodwrz_rLSjjtEDqDRQ23wCPf-YpH_34A";


const GET_COMMENTS_BASE =
  "https://prod-11.uksouth.logic.azure.com/workflows/2c15f9a1cb5b4e529129e58386ae0a00/triggers/When_an_HTTP_request_is_received/paths/invoke/videos/";
const GET_COMMENTS_SUFFIX =
  "/comments?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=qMr1qa_DWz8jzEfq23GjkEMZZyWdZQ4EJtfrbzQtrJU";


const BLOB_ACCOUNT = "https://yousharestorage2.blob.core.windows.net";

let ALL_VIDEOS_CACHE = [];   
let IS_LOADED_ONCE = false;  


$(document).ready(function () {
  $("#subNewForm").click(uploadVideo);   
  $("#retImages").click(getAllVideos);   
});



function uploadVideo() {
  const file = $("#UpFile")[0].files[0];
  if (!file) {
    alert("Please choose a video file.");
    return;
  }

  const formData = new FormData();
  formData.append("userID", $("#userID").val());
  formData.append("userName", $("#userName").val());
  formData.append("caption", $("#caption").val());
  formData.append("description", $("#description").val());
  formData.append("visibility", $("#visibility").val());
  formData.append("File", file);

  $.ajax({
    url: POST_VIDEO_URL,
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function (data) {
      console.log("Upload response:", data);
      alert("Upload successful!");
      getAllVideos();
    },
    error: function (xhr) {
      console.error("Upload failed:", xhr?.responseText);
      alert("Upload failed — check Console (F12).");
    }
  });
}



function getAllVideos() {
  const $list = $("#ImageList");
  $list
    .addClass("media-grid")
    .html('<div class="spinner-border" role="status"><span>Loading...</span></div>');

  $.ajax({
    url: GET_ALL_VIDEOS_URL,
    type: "GET",
    dataType: "json",
    success: function (data) {
      console.log("GET all response:", data);

      if (!Array.isArray(data) || data.length === 0) {
        $list.html("<p>No videos found.</p>");
        return;
      }

      const cards = data.map(v => buildVideoCard(v));
      $list.html(cards.join(""));
    },
    error: function (xhr) {
      console.error("GET all failed:", xhr?.responseText);
      $list.html("<p style='color:red;'>Error loading videos. Check Console (F12).</p>");
    }
  });
}


function getOneVideo(id) {
  const url = GET_ONE_BASE + encodeURIComponent(id) + GET_ONE_SUFFIX;
  console.log("GET ONE URL:", url);

  $.ajax({
    url,
    type: "GET",
    success: function (data) {
      
      const obj = (typeof data === "string") ? JSON.parse(data) : data;

      alert(
        "Caption: " + (obj.caption ?? "") + "\n" +
        "Description: " + (obj.description ?? "") + "\n" +
        "Visibility: " + (obj.visibility ?? "") + "\n" +
        "Uploaded by: " + (obj.userName ?? "") + " (id: " + (obj.userID ?? "") + ")\n" +
        "File name: " + (obj.fileName ?? "") + "\n" +
        "Uploaded at: " + (obj.uploadedAt ?? "")
      );
    },
    error: function (xhr) {
      console.error("GET one failed:", xhr?.responseText);
      alert("GET one failed — check Console (F12).");
    }
  });
}


function editVideo(fileLocator) {
  const newCaption = prompt("New caption?");
  if (newCaption === null) return;

  const newDescription = prompt("New description?");
  if (newDescription === null) return;

  const url = PUT_BASE + encodeURIComponent(fileLocator) + PUT_SUFFIX;
  console.log("PUT URL:", url);

  $.ajax({
    url,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify({ caption: newCaption, description: newDescription }),
    success: function () {
      alert("Updated!");
      getAllVideos();
    },
    error: function (xhr) {
      console.error("PUT failed:", xhr?.responseText);
      alert("Update failed — check Console (F12).");
    }
  });
}



function deleteVideo(idForRoute) {
  if (!confirm("Delete this video?")) return;

  const url = DELETE_BASE + encodeURIComponent(idForRoute) + DELETE_SUFFIX;
  console.log("DELETE URL:", url);

  $.ajax({
    url,
    type: "DELETE",
    success: function () {
      alert("Deleted!");
      getAllVideos();
    },
    error: function (xhr) {
      console.error("DELETE failed:", xhr?.responseText);
      alert("Delete failed — check Console.");
    }
  });
}



function postComment(videoKey, safeId) {
  const user = $(`#cUser-${safeId}`).val()?.trim();
  const text = $(`#cText-${safeId}`).val()?.trim();

  if (!user || !text) {
    alert("Enter your name and a comment.");
    return;
  }

  const payload = {
    videoId: String(videoKey),   
    Comment: String(text),
    userName: String(user)
  };

  console.log("POST comment URL:", POST_COMMENT_URL);
  console.log("POST comment payload:", payload);

  $.ajax({
    url: POST_COMMENT_URL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    cache: false,
    success: function (res) {
    
      let obj = res;
      if (typeof obj === "string") {
        try { obj = JSON.parse(obj); } catch { }
      }

      console.log("POST comment response:", obj);

      
      const hasCreatedDoc =
        obj && typeof obj === "object" &&
        (obj.id || obj._rid) && 
        (obj.videoId || obj.videoID);

      if (!hasCreatedDoc) {
        alert("POST returned success, but did not return a created comment document. Check POST Logic App Response mapping.");
      } else {
        alert("Comment posted ✅");
      }

     
      $(`#cText-${safeId}`).val("");
      loadComments(videoKey, safeId);
    },
    error: function (xhr) {
      console.error("POST comment failed:", xhr.status, xhr.responseText);
      alert("POST failed — check console (F12).");
    }
  });
}

function loadComments(videoKey, safeId) {
  const url = GET_COMMENTS_BASE + encodeURIComponent(videoKey) + GET_COMMENTS_SUFFIX;
  const $target = $(`#cList-${safeId}`);

// Toggle behavior
if ($target.is(":visible")) {
  $target.slideUp(150);
  return;
}

$target.slideDown(150);

  console.log("GET comments URL:", url);
  $target.html("<div class='muted'>Loading comments...</div>");

  $.ajax({
    url,
    type: "GET",
    dataType: "json",
    cache: false,
    success: function (data) {
      console.log("RAW comments payload:", data);

      
      let payload = data;
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch { payload = []; }
      }

     
      let arr = [];
      if (Array.isArray(payload)) arr = payload;
      else if (payload && Array.isArray(payload.value)) arr = payload.value;
      else if (payload && Array.isArray(payload.Documents)) arr = payload.Documents;
      else arr = [];

      const wanted = String(videoKey);

      
      const cleaned = arr
        .filter(x => x && typeof x === "object")
        .filter(x => String(x.videoId ?? x.videoID ?? "") === wanted)
        .map(x => ({
          userName: x.userName ?? x.UserName ?? "Anon",
          text: x.text ?? x.Text ?? x.Comment ?? x.comment ?? "",
          createdAt: x.createdAt ?? x.CreatedAt ?? ""
        }))
        .filter(x => x.text && String(x.text).trim().length > 0);

      if (cleaned.length === 0) {
        $target.html("<div class='muted'>No comments yet.</div>");
        return;
      }

      const html = cleaned.map(c => {
        const u = escapeHtml(c.userName);
        const t = escapeHtml(c.text);
        const d = escapeHtml(c.createdAt);
        return `
          <div style="border-top:1px solid #eee; padding:6px 0;">
            <b>${u}</b>: ${t}
            ${d ? `<div class="muted" style="font-size:11px;">${d}</div>` : ""}
          </div>
        `;
      }).join("");

      $target.html(html);
    },
    error: function (xhr) {
      console.error("GET comments failed:", xhr.status, xhr.responseText);
      $target.html("<div style='color:#b91c1c;'>Failed to load comments.</div>");
    }
  });
}







function cssSafe(id) {
  return String(id).replace(/[^a-zA-Z0-9\-_:.]/g, "_");
}


function makePostmanIdFromVideo(video) {
  
  let path = (video && video.filePath) ? String(video.filePath) : "";
  if (!path) {
    const loc = (video && video.fileLocator) ? String(video.fileLocator) : "";
    if (loc) path = "/videos/" + loc;
  }
  if (!path) return "";

  
  let encoded = encodeURIComponent(path);
  encoded = encoded.replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());

 
  return btoa(encoded);
}

function buildVideoCard(video) {
  const fileLocator = String(video.fileLocator || "");
  const filePathRaw = String(video.filePath || "");
  const blobPath = filePathRaw || (fileLocator ? ("/videos/" + fileLocator) : "");
  const videoUrl = buildBlobUrl(blobPath);
  const rawId = video.id;
  const safeId = cssSafe(rawId);


  
  const idForRoute = makePostmanIdFromVideo(video);

  const caption = escapeHtml(video.caption || "");
  const description = escapeHtml(video.description || "");
  const visibility = escapeHtml(video.visibility || "");
  const userName = escapeHtml(video.userName || "");
  const userID = escapeHtml(video.userID || "");
  const uploadedAt = escapeHtml(video.uploadedAt || "");

  return `
    <div class="media-card">
      <div class="media-thumb">
        <video controls preload="metadata">
          <source src="${videoUrl}" type="video/mp4">
        </video>
      </div>

      <div class="media-body">
        <span class="media-title">${caption || fileLocator || "(video)"}</span>
        <div><b>Description:</b> ${description}</div>
        <div class="muted"><b>Visibility:</b> ${visibility}</div>
        <div class="muted"><b>Uploaded by:</b> ${userName} (id: ${userID})</div>
        <div class="muted"><b>Uploaded at:</b> ${uploadedAt}</div>

        <div class="actions">
          <button class="btn btn-sm btn-outline-secondary" onclick="getOneVideo('${escapeAttr(idForRoute)}')">GET</button>
          <button class="btn btn-sm btn-outline-primary" onclick="editVideo('${escapeAttr(idForRoute)}')">EDIT</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteVideo('${escapeAttr(idForRoute)}')">DELETE</button>
        </div>

        <div class="muted" style="margin-top:8px;font-size:12px;">
          id used (postman-style): ${escapeHtml(idForRoute)}
        </div>
      </div>
    </div>

      <div class="comment-panel" style="margin-top:12px;">
  <div style="display:flex; gap:8px; margin-bottom:6px;">
    <input
      id="cUser-${safeId}"
      class="form-control"
      placeholder="Your name"
      style="max-width:160px;"
    >

    <input
      id="cText-${safeId}"
      class="form-control"
      placeholder="Write a comment..."
    >
  </div>

  <div style="display:flex; gap:8px;">
       <button class="btn btn-outline"
  onclick="postComment('${escapeAttr(rawId)}','${escapeAttr(safeId)}')">
  Post
</button>

<button class="btn btn-outline"
  onclick="loadComments('${escapeAttr(rawId)}','${escapeAttr(safeId)}')">
  View comments
</button>



  </div>

  <div
  id="cList-${safeId}"
  class="comment-list"
></div>

</div>


  `;
}




function buildBlobUrl(path) {
  if (!path) return "";
  const trimmed = String(path).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const left = (BLOB_ACCOUNT || "").replace(/\/+$/g, "");
  const right = trimmed.replace(/^\/+/g, "");
  return `${left}/${right}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#039;");
}

$(document).ready(function () {
  $("#subNewForm").click(uploadVideo);
  $("#retImages").click(getAllVideos);

  // Search hooks
  $("#btnSearch").click(searchByCaption);
  $("#btnClearSearch").click(clearSearch);

  $("#searchCaption").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      searchByCaption();
    }
  });
});

// =======================
// SEARCH (ADD AT BOTTOM)
// =======================

function searchByCaption() {
  const term = $("#searchCaption").val().trim().toLowerCase();

  if (!term) {
    $("#searchStatus").text("Type a caption to search.");
    return;
  }

  // Ensure we have videos loaded
  if (!Array.isArray(ALL_VIDEOS_CACHE) || ALL_VIDEOS_CACHE.length === 0) {
    $("#searchStatus").text("Loading videos first...");
    $.ajax({
      url: GET_ALL_VIDEOS_URL,
      type: "GET",
      dataType: "json",
      success: function (data) {
        ALL_VIDEOS_CACHE = Array.isArray(data) ? data : [];
        IS_LOADED_ONCE = true;
        findAndGetOne(term);
      },
      error: function (xhr) {
        console.error("GET all (for search) failed:", xhr?.responseText);
        $("#searchStatus").text("Failed to load videos for search.");
      }
    });
    return;
  }

  findAndGetOne(term);
}

function findAndGetOne(term) {
  // Find FIRST match by caption (contains)
  const match = ALL_VIDEOS_CACHE.find(v =>
    String(v.caption || "").toLowerCase().includes(term)
  );

  if (!match) {
    $("#searchStatus").text(`No matches for "${term}".`);
    $("#ImageList").html("<p class='text-muted mb-0'>No matching videos found.</p>");
    return;
  }

  // Build the exact same route-id you show on the card buttons
  const idForRoute = makePostmanIdFromVideo(match);

  $("#searchStatus").text(`Match found: "${match.caption}". Calling GET /videos/{id}...`);

  // ✅ This calls your GET ONE Logic App (shows alert in your getOneVideo)
  getOneVideo(idForRoute);

  // Optional: also show only the matched card in the UI
  $("#ImageList").html(buildVideoCard(match));
}


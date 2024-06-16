f.onchange = function() {
    var zip = new JSZip();
    var followingFile = 'connections/followers_and_following/following.json';
    var followersFile = 'connections/followers_and_following/followers_1.json';

    var followingUsernames = [];
    var followersUsernames = [];
    var unfollowersCount = 0;

    zip.loadAsync(this.files[0])
       .then(function(zip) {
            document.getElementById("status").innerHTML = "processing...";
            document.getElementById("status").style.display = "block";

            // Check if following.json file exists in the specified directory
            if (zip.file(followingFile)) {
                return zip.file(followingFile).async("string");
            } else {
                throw new Error(followingFile + " not found in the zip file");
            }
       })
       .then(function(jsonData) {
            // Parse the JSON string into a JavaScript object
            const data = JSON.parse(jsonData);

            // Check if relationships_following exists and is an array
            if (data.relationships_following && Array.isArray(data.relationships_following)) {
                // Extract the relationships_following array
                const relationships = data.relationships_following;

                // Iterate through the relationships array and extract usernames
                relationships.forEach(relationship => {
                    if (relationship.string_list_data && Array.isArray(relationship.string_list_data)) {
                        relationship.string_list_data.forEach(item => {
                            followingUsernames.push(item.value); // Add username to followingUsernames array
                        });
                    }
                });

                console.log("Usernames from following.json extracted successfully!");

                // After extracting following usernames, proceed to load and process followers_1.json
                return zip.file(followersFile).async("string");
            } else {
                throw new Error("relationships_following is not an array or does not exist in following.json");
            }
       })
       .then(function(jsonData) {
            // Parse the JSON string from followers_1.json into a JavaScript object
            const followersData = JSON.parse(jsonData);

            // Iterate through the followersData array and extract usernames
            followersData.forEach(entry => {
                if (entry.string_list_data && Array.isArray(entry.string_list_data)) {
                    entry.string_list_data.forEach(item => {
                        followersUsernames.push(item.value); // Add username to followersUsernames array
                    });
                }
            });

            console.log("Usernames from followers_1.json extracted successfully!");

            // Print the lengths of both arrays
            console.log("Number of usernames in following.json:", followingUsernames.length);
            console.log("Number of usernames in followers_1.json:", followersUsernames.length);

            // Now check for usernames in following that are not in followers
            followingUsernames.forEach(username => {
                if (!followersUsernames.includes(username)) {
                    // Add the username to the unfollows list
                    document.getElementById("results").style.display = "block";
                    const unfollowsList = document.getElementById("unfollows-list");
                    const li = document.createElement("li");
                    li.textContent = username;
                    li.onclick = function() {
                        window.open("https://www.instagram.com/" + username);
                    };
                    unfollowsList.appendChild(li);
                    unfollowersCount++;
                }
            });

            document.getElementById("status").innerHTML = "finished! found " + unfollowersCount + " people that do not follow you back.";
       })
       .catch(function(error) {
            console.error("Error during processing:", error);
            // Handle the error accordingly, such as displaying an error message to the user
       });
};

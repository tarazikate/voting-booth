// Define API endpoints for candidates, candidates with ballot counts, and voters
const endpoint = {
    candidates: 'http://localhost:3006/', // Endpoint to fetch candidates
    candidatesWithBallots: 'http://localhost:3006/ballots', // Endpoint to fetch candidates with vote counts
    voters: 'http://localhost:3002/' // Endpoint to fetch voters
};

// Define views for the application
const viewType = {
    home: 'home', // Home view
    ballot: 'ballot', // Ballot view for voting
    results: 'results' // Results view to display election results
};

// Object to store the current voter's information
let voterPackage = {};

// initialize the page and set up event listeners
function initPage() {
    // Load initial content for the home view
    loadContent(viewType.home);

    // Modal and button setup for adding voters and showing results
    const modal = document.getElementById("myModal");
    const voteModal = document.getElementById("voteModal");
    const addButton = document.getElementById("addBtn");
    const showResultsButton = document.getElementById("showResults");
    const closeButtons = document.querySelectorAll(".close");

    // Open the modal when "Add" button is clicked
    addButton.onclick = () => {
        modal.style.display = "block";
    };

    // Load results when "Show Results" button is clicked
    showResultsButton.onclick = () => {
        loadResults();
    };

    // Close modals when "X" buttons are clicked
    closeButtons.forEach(close => {
        close.onclick = () => {
            modal.style.display = "none";
            voteModal.style.display = "none";
        };
    });

    // Close modals when clicking outside of them
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === voteModal) {
            voteModal.style.display = "none";
        }
    };

    // Add new voter when the submit button is clicked
    const submitButton = document.getElementById('SubmitBtn');
    submitButton.onclick = (event) => {
        event.preventDefault(); // Prevent the default form submission
        recordNewVoter(); // Call the function to add the voter
    };
}

// Load the content of the page based on the selected view
function loadContent(view) {
    switch (view) {
        case viewType.home:
            // Hide results section and fetch candidates and voters
            document.getElementById('results-section').style.display = 'none';
            fetchAndListCandidates(false);
            fetchAndListVoters();
            break;
        case viewType.ballot:
            // Display the ballot for voting
            fetchAndDrawBallot();
            break;
        case viewType.results:
            // Load and display the results
            loadResults();
            break;
    }
}

// Fetch and display the list of candidates
function fetchAndListCandidates(showVotes) {
    const target = showVotes ? 'candidatesWithBallots' : 'candidates';
    fetch(endpoint[target]) // Fetch candidates or candidates with vote counts
        .then(response => response.json())
        .then(result => {
            const listElement = document.getElementById('candidateList');
            listElement.innerHTML = ""; // Clear previous entries
            const list = document.createElement('ul');
            result.forEach(candidate => {
                const li = document.createElement('li');
                li.textContent = showVotes
                    ? `${candidate.name} (Votes: ${candidate.voteCount})`
                    : candidate.name; // Show votes if requested
                list.appendChild(li);
            });
            listElement.appendChild(list);
        })
        .catch(error => console.error('Error fetching candidates:', error));
}

// Fetch and display the list of voters
function fetchAndListVoters() {
    fetch(endpoint.voters) // Fetch all voters
        .then(response => response.json())
        .then(result => {
            const potentialBallots = []; // Voters who haven't voted
            const completedBallots = []; // Voters who have voted

            // Categorize voters based on their voting status
            result.forEach(voter => {
                if (!voter.ballot) {
                    potentialBallots.push(voter);
                } else {
                    completedBallots.push(voter);
                }
            });

            // Populate the lists of voters
            populateVoterList('potentialBallots', potentialBallots);
            populateList('completedBallots', completedBallots, 'name');
        })
        .catch(error => console.error('Error fetching voters:', error));
}

// Populate the list of voters who haven't voted with voting options
function populateVoterList(targetId, voters) {
    const element = document.getElementById(targetId);
    element.innerHTML = ""; // Clear previous entries
    const list = document.createElement('ul');
    voters.forEach(voter => {
        const li = document.createElement('li');
        li.textContent = voter.name;

        // Add a button to allow voting
        const voteButton = document.createElement('button');
        voteButton.textContent = 'Vote';
        voteButton.onclick = () => openVoteModal(voter.name); // Open voting modal
        li.appendChild(voteButton);

        list.appendChild(li);
    });
    element.appendChild(list);
}

// Open the vote modal for the selected voter
function openVoteModal(voterName) {
    voterPackage.name = voterName; // Store the voter's name

    fetch(endpoint.candidates) // Fetch the list of candidates
        .then(response => response.json())
        .then(candidates => {
            const candidateOptions = document.getElementById('candidateOptions');
            candidateOptions.innerHTML = ""; // Clear previous entries
            candidates.forEach(candidate => {
                const button = document.createElement('button');
                button.textContent = candidate.name;
                button.onclick = () => recordVoterAndVote(candidate.name); // Record vote
                candidateOptions.appendChild(button);
            });

            // Display the vote modal
            const voteModal = document.getElementById('voteModal');
            voteModal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching candidates:', error));
}

// Record a voter's vote
function recordVoterAndVote(candidateName) {
    if (!voterPackage.name) {
        alert('Error: Voter name is missing.');
        return;
    }

    fetch(endpoint.voters, {
        method: 'PUT', // Update the voter's ballot
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: voterPackage.name, candidate: candidateName })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message || 'Vote recorded successfully.');
            voterPackage = {}; // Reset voter package
            document.getElementById('voteModal').style.display = 'none'; // Close modal
            fetchAndListVoters(); // Refresh voter list
        })
        .catch(error => console.error('Error recording vote:', error));
}

// Load and display the results of the election
function loadResults() {
    fetch(endpoint.candidatesWithBallots) // Fetch candidates with vote counts
        .then(response => response.json())
        .then(candidates => {
            const resultsList = document.getElementById('resultsList');
            resultsList.innerHTML = ""; // Clear previous entries
            const list = document.createElement('ul');
            candidates.forEach(candidate => {
                const li = document.createElement('li');
                li.textContent = `${candidate.name}: ${candidate.voteCount} votes`;
                list.appendChild(li);
            });
            resultsList.appendChild(list);

            // Display the results section
            document.getElementById('results-section').style.display = 'block';
        })
        .catch(error => console.error('Error loading results:', error));
}

// Helper function to populate a list with generic data
function populateList(targetId, data, idField) {
    const element = document.getElementById(targetId);
    element.innerHTML = ""; // Clear previous entries
    const list = document.createElement('ul');
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item[idField]; // Use the specified field as the text
        list.appendChild(li);
    });
    element.appendChild(list);
}

// Add a new voter to the system
function recordNewVoter() {
    const userName = document.getElementById('userName').value.trim();
    if (!userName) {
        alert('Name cannot be empty.');
        return;
    }

    fetch(endpoint.voters, {
        method: 'POST', // Add a new voter
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }) // Send the voter's name
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message || 'Voter added successfully.');
            document.getElementById('userName').value = ""; // Clear input field
            document.getElementById('myModal').style.display = 'none'; // Close modal
            fetchAndListVoters(); // Refresh voter list
        })
        .catch(error => console.error('Error adding voter:', error));
}


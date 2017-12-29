var toggle = 1;

// Constants
var rankLetters = ["E", "D", "C", "B", "A", "★", "★★", "★★★"];
var eventRankData = [[26, 29, 31, 33, 35, 36, 37], [8, 14, 20, 25, 27, 28, 29], [30, 34, 37, 39, 41, 42, 43], [16, 18, 20, 22, 24, 26, 28], [27, 30, 32, 34, 35, 36, 37], [22, 24, 25, 26, 27, 28, 29], [16, 18, 20, 22, 24, 26, 28], [24, 28, 32, 36, 38, 40, 42], [16, 18, 20, 22, 24, 26, 28], [27, 31, 33, 35, 36, 37, 38]];

// Global stuff
var profiles = [];
var highScores = [];
var bestRuns = [];
var mostStars = [];
var highestRatings = [];

// Menu Variables
var panelColors = [];
var totalColors = 8; // Increase this when adding more colors.
var menuMode = ["", 0];
var profilePage = 0;
var playerProfiles = [null, null, null, null];

// Game Variables
var players = [];
var roundNumber = 0;
var turn = 0;
var setNumber = 0;
var sets = 0;
var events = [];
var eventNames = ["100 Meters", "Long Jump", "Shot Put", "High Jump", "400 Meters", "110m Hurdles", "Discus", "Pole Vault", "Javelin", "1500 Meters"];
var eventRules = [];
var eventID = 0;
var dice = [];
var diceSum = 0;
var freezeSum = 0;
var frozen = [];
var lives = 0;
var rerolls = 0;
var toRoll = 0;
var goalHeight = 0;
var diceToRoll = 2;
var activePlayers = [];
var freezeButtons = false;
var rollingDice = false;
var leftOption = "";
var rightOption = "";
var tickPoints = false;
var tickPointsFinished = [];
var roundEnded = false;
var disableClicks = false;
var toBlockLeft = false;
var toBlockRight = false;
var buttonStatus = false;
var soloGame = false;
var uiColor = -1;
var gameBodyScreen = 1;

// All clicky stuff goes here
$(function () {
    makeDivs();
    resizeWindow();
    $(window).resize(function () {
        resizeWindow();
    });
    $.ajax("files/rules.txt").done(function (data) {
        eventRules = data.split("\n===\n");
        for (var i = 0; i < eventRules.length; i++) {
            eventRules[i] = eventRules[i].replace(/\n/g, "<br>");
        }
    });
    window.setInterval(function () {
        tick();
    }, 50);

    $("body").click(function () {
        // Testing area

    });
    $("body").keydown(function (event) {
        if (event.which == 80) {
            //profiles[0].highScoreEventScores[0] += 20;
        } else if (event.which == 83) {
            saveGame();
        } else if (event.which == 67) {
            //clearData();
        } else if (event.which == 81) {
            endTurn();
        }
        updateUI();
    });
    // Menu
    // Player panels
    for (var i = 0; i < 4; i++) {
        initPlayerPanelClicked(i);
    }
    // Profile panels
    for (var i = 0; i < 5; i++) {
        initProfilePanelClicked(i);
    }
    $("#player_list_left").click(function () {
        changeProfilePage(-1);
    });
    $("#player_list_right").click(function () {
        changeProfilePage(1);
    });
    $("#start_button").click(function () {
        animateStartGame();
    });
    $("#new_profile_back").click(function () {
        hideNewProfile();
    });
    $("#new_profile_accept").click(function () {
        addNewProfile();
    });
    // Game
    // Left option
    $("#gamearea_buttons_left").click(function () {
        if (!toBlockLeft) {
            if (leftOption == "reroll" && rerolls > 0) {
                rollDice();
                rerolls -= 1;
                updateUI();
            } else if (leftOption == "roll") {
                rollDice();
                leftOption = "reroll";
                updateUI();
            } else if (leftOption == "addroll" && toRoll < dice.length) {
                addDie();
                updateUI();
            } else if (leftOption == "attempt") {
                attemptHeight();
                updateUI();
            }
        }
    });
    // Right option
    $("#gamearea_buttons_right").click(function () {
        if (!toBlockRight) {
            if (rightOption == "accept") {
                if (eventID == 1 && setNumber == 1) {
                    startJumpPhase();
                } else if ((eventID == 1 && setNumber == 2) || (eventID == 2) || (eventID == 6) || (eventID == 8)) {
                    acceptAttempt();
                } else {
                    acceptRoll();
                }
                updateUI();
            } else if (rightOption == "forfeit") {
                forfeitAttempt();
            } else if (rightOption == "skip") {
                skipHeight();
            } else if (rightOption == "continue") {
                passHeight();
            } else if (rightOption == "end") {
                failHeight();
            }
        }
    });
    // Clicks
    for (var i = 0; i < 8; i++) {
        initFreezeClicked(i);
    }
    $("#gamearea_dice_buttons_left").click(function () {
        minusOneDie();
    });
    $("#gamearea_dice_buttons_right").click(function () {
        plusOneDie();
    });
    // Game screen
    $("#gamerecordsbutton").click(function () {
        if (gameBodyScreen == 0) {
            setGameBodyScreen(1, true);
        } else {
            setGameBodyScreen(0, true);
        }
    });
    $("#gamehelpbutton").click(function () {
        if (gameBodyScreen == 2) {
            setGameBodyScreen(1, true);
        } else {
            setGameBodyScreen(2, true);
        }
    });
    // Results screen
    $("#results_continue").click(function () {
        exitResults();
        $("#titleScreen").css({
            'z-index': 500,
            'opacity': 1
        });
        $("#gameScreen").css({
            'z-index': -500,
            'opacity': 0
        });
    });
    initRecords();
    initMenu();
    resizeWindow();
});

function initPlayerPanelClicked(n) {
    $("#select_player_panel" + n).click(function () {
        playerPanelClicked(n);
    });
}

function initProfilePanelClicked(n) {
    $("#player_list_panel" + n).click(function () {
        profilePanelClicked(n);
    });
}

function initFreezeClicked(n) {
    $("#gamearea_dice_box_freeze" + n).click(function () {
        freezeClicked(n);
    });
}

function makeDivs() {
    // Title screen: player select panels
    $("#player_info").empty();
    for (var i = 0; i < 4; i++) {
        var divPanel = $('<div id="select_player_panel' + i + '" class="select_player_panel"></div>');
        var divName = $('<div id="select_player_name' + i + '" class="select_player_name"></div>');
        divName.append('<div id="select_player_name_text' + i + '" class="select_player_name_text font textC"></div>');
        divPanel.append(divName);
        var divRank = $('<div id="select_player_rank' + i + '" class="select_player_rank"></div>');
        divRank.append('<div id="select_player_rank_text' + i + '" class="select_player_rank_text font textC"></div>');
        divPanel.append(divRank);
        var divOverlay = $('<div id="select_player_overlay' + i + '" class="select_player_overlay"></div>');
        divOverlay.append('<div id="select_player_topbar' + i + '" class="select_player_topbar"></div>');
        divOverlay.append('<div id="select_player_bottombar' + i + '" class="select_player_bottombar"></div>');
        var divBox = $('<div id="select_player_box' + i + '" class="select_player_box"></div>');
        divBox.append('<div id="select_player_box_text' + i + '" class="select_player_box_text font textC"></div>');
        divOverlay.append(divBox);
        divPanel.append(divOverlay);
        $("#player_info").append(divPanel);
    }
    // Title screen: player names
    $("#player_list_panels").empty();
    for (var i = 0; i < 5; i++) {
        var divPanel = $('<div id="player_list_panel' + i + '" class="player_list_panel"></div>');
        divPanel.append('<div id="player_list_text' + i + '" class="player_list_text font textC"></div>');
        divPanel.css('top', (16 + 14 * i) + "%");
        $("#player_list_panels").append(divPanel);
    }
    // Game screen: player UI
    $("#ui_scores").empty();
    for (var i = 0; i < 4; i++) {
        var divUI = $('<div id="ui_score' + i + '" class="ui_score noselect"></div>');
        divUI.append('<div id="ui_score_name' + i + '" class="ui_score_name font color_p' + i + '"><div class="ui_score_name_text textC"></div></div>');
        divUI.append('<div id="ui_score_roundScore' + i + '" class="ui_score_roundScore font color_p' + i + '"><div class="ui_score_roundScore_text textC"></div></div>');
        divUI.append('<div id="ui_score_totalScore' + i + '" class="ui_score_totalScore font color_p' + i + '"><div class="ui_score_totalScore_text textC"></div></div>');
        var divHigh = $('<div id="ui_score_newHighScore' + i + '" class="ui_score_newHighScore color_p' + i + '"></div>');
        divHigh.append('<div id="ui_score_darkBox' + i + '" class="ui_score_darkBox ui_score_darkBox_fade_anim"></div>');
        divHigh.append('<div id="ui_score_newHighScore_title' + i + '" class="ui_score_newHighScore_title font fs-36">New Personal Best!</div>');
        divHigh.append('<div id="ui_score_newHighScore_oldScore' + i + '" class="ui_score_newHighScore_oldScore font fs-90"></div>');
        divHigh.append('<div id="ui_score_newHighScore_newScore' + i + '" class="ui_score_newHighScore_newScore font fs-90"></div>');
        divHigh.append('<div id="ui_score_newHighScore_oldRank' + i + '" class="ui_score_newHighScore_oldRank font fs-40"></div>');
        divHigh.append('<div id="ui_score_newHighScore_newRank' + i + '" class="ui_score_newHighScore_newRank font fs-40"></div>');
        divHigh.append('<div id="ui_score_newHighScore_triangle' + i + '" class="ui_score_newHighScore_triangle font fs-40">▶</div>');
        divUI.append(divHigh);
        $("#ui_scores").append(divUI);
    }
    // Game screen: top bar
    $("#ui_round_bar_top").empty();
    for (var i = 0; i < 10; i++) {
        var divSection = $('<div id="ui_round_bar_section' + i + '" class="ui_round_bar_section">');
        divSection.append('<div class="ui_round_bar_box"><div id="ui_round_bar_circle' + i + '" class="ui_round_bar_circle"></div></div>');
        $("#ui_round_bar_top").append(divSection);
    }
    // Game screen: dice boxes
    $("#gamearea_dice_boxes").empty();
    for (var i = 0; i < 8; i++) {
        var divBox = $('<div id="gamearea_dice_box' + i + '" class="gamearea_dice_box">');
        divBox.append('<div id="gamearea_dice_box_die' + i + '" class="gamearea_dice_box_die"></div>');
        divBox.append('<div id="gamearea_dice_box_freeze' + i + '" class="gamearea_dice_box_freeze font">❄</div>');
        $("#gamearea_dice_boxes").append(divBox);
    }
    // Game screen: event records
    $("#gamerecords_boxes").empty();
    for (var i = 0; i < 3; i++) {
        var divBox = $('<div id="gamerecords_box' + i + '" class="gamerecords_box"></div>');
        divBox.append('<div id="gamerecords_box_name' + i + '" class="gamerecords_box_name font textC">-----</div>');
        divBox.append('<div id="gamerecords_box_score' + i + '" class="gamerecords_box_score font textC">--</div>');
        divBox.append('<div id="gamerecords_box_rank' + i + '" class="gamerecords_box_rank font textC">-----</div>');
        $("#gamerecords_boxes").append(divBox);
    }
    $("#gamerecords_pbs").empty();
    for (var i = 0; i < 4; i++) {
        var divPb = $('<div id="gamerecords_pb' + i + '" class="gamerecords_pb color_l' + i + '"></div>');
        divPb.css("left", (2.5 + 25 * i) + "%");
        divPb.append('<div id="gamerecords_pb_name' + i + '" class="gamerecords_pb_name font">-----</div>');
        divPb.append('<div id="gamerecords_pb_score' + i + '" class="gamerecords_pb_score font">--</div>');
        divPb.append('<div id="gamerecords_pb_rank' + i + '" class="gamerecords_pb_rank font">-----</div>');
        $("#gamerecords_pbs").append(divPb);
    }
    // End screen: score panels
    $("#results_panels").empty();
    for (var i = 0; i < 4; i++) {
        $("#results_panels").append('<div id="results_panel' + i + '" class="results_panel panel' + i + ' color_p' + i + '"></div>');
        var divPanel = $('<div id="results_panel_text' + i + '" class="results_panel_text panel' + i + '">');
        divPanel.append('<div id="results_panel_title' + i + '" class="results_panel_title font fs-60"></div>');
        divPanel.append('<div id="results_panel_name' + i + '" class="results_panel_name font fs-50"></div>');
        divPanel.append('<div id="results_panel_score' + i + '" class="results_panel_score font fs-150"></div>');
        $("#results_panels").append(divPanel);
    }
}

function initRecords() {
    // Records event sections
    for (var i = 0; i < 10; i++) {
        $("#records_events").append("<div id='records_event" + i + "' class='records_event'></div>");
        $("#records_event" + i).append("<div id='records_event_title" + i + "' class='records_event_title font fs-30'></div>");
        $("#records_event" + i).append("<div id='records_event_line" + i + "' class='records_event_line'></div>");
        for (var j = 1; j <= 3; j++) {
            $("#records_event" + i).append("<div id='records_event_score" + j + "_" + i + "' class='records_event_score" + j + " font fs-45'></div>");
            $("#records_event" + i).append("<div id='records_event_name" + j + "_" + i + "' class='records_event_name" + j + " font fs-30'></div>");
        }
        $("#records_event" + i).css({
            'left': ((i % 5) * 20) + "%",
            'top': (Math.floor(i / 5) * 50) + "%",
            'background-color': (i % 2 == 0 ? "#000000" : "#222222")
        });
    }
    // Lower sections
    var ids = ["runs", "stars", "ratings"];
    var titles = ["Best Runs", "Most Stars", "Highest Ratings"];
    for (var i = 0; i < 3; i++) {
        // Main div
        $("#records").append("<div id='records_" + ids[i] + "' class='records_section'></div>");
        // Title and line
        $("#records_" + ids[i]).append("<div id='records_title" + i + "' class='records_title font fs-42'></div>");
        $("#records_title" + i).text(titles[i]);
        $("#records_" + ids[i]).append("<div id='records_line" + i + "' class='records_line'></div>");
        for (var j = 1; j <= 5; j++) {
            $("#records_" + ids[i]).append("<div id='records_section_score" + j + "_" + i + "' class='records_section_score records_section_score" + j + " font fs-54'></div>");
            $("#records_" + ids[i]).append("<div id='records_section_name" + j + "_" + i + "' class='records_section_name records_section_name" + j + " font fs-36'></div>");
        }
    }
    for (var i = 1; i <= 5; i++) {
        $(".records_section_score" + i).css("top", (5 + 15.5 * i) + "%");
        $(".records_section_name" + i).css("top", (7.5 + 15.5 * i) + "%");
    }
    // Individual records TODO
    // Event listeners for buttons
    $("#playerstats_button_scores").click(function () {
        showPlayerStatsScreen(0);
    });
    $("#playerstats_button_stars").click(function () {
        showPlayerStatsScreen(1);
    });
    $("#playerstats_button_stats").click(function () {
        showPlayerStatsScreen(2);
    });
    // Records event sections
    for (var i = 0; i < 10; i++) {
        $("#playerstats_scores_events").append("<div id='playerstats_scores_event" + i + "' class='playerstats_scores_event'></div>");
        $("#playerstats_scores_event" + i).append("<div id='playerstats_scores_event_title" + i + "' class='playerstats_scores_event_title font fs-30'></div>");
        $("#playerstats_scores_event" + i).append("<div id='playerstats_scores_event_line" + i + "' class='playerstats_scores_event_line'></div>");
        $("#playerstats_scores_event" + i).append("<div id='playerstats_scores_event_score" + i + "' class='playerstats_scores_event_score font fs-100'></div>");
        $("#playerstats_scores_event" + i).append("<div id='playerstats_scores_event_rank" + i + "' class='playerstats_scores_event_rank font fs-45'></div>");
        $("#playerstats_scores_event" + i).css({
            'left': ((i % 5) * 20) + "%",
            'top': (Math.floor(i / 5) * 50) + "%",
            'background-color': (i % 2 == 0 ? "#000000" : "#222222")
        });
    }
    // Challenge boxes
    for (var i = 0; i < 90; i++) {
        $("#playerstats_stars_challenges").append("<div id='playerstats_stars_challenge" + i + "' class='playerstats_stars_challenge'></div>");
        $("#playerstats_stars_challenge" + i).css({
            'left': ((i % 15) * 6.66667) + "%",
            'top': (Math.floor(i / 15) * 16.66667) + "%",
            'background-color': (i % 2 == 0 ? "#000000" : "#222222")
        });
    }
}

function initMenu() {
    // Bring menu to front
    $("#titleScreen").css({
        'z-index': 500,
        'opacity': 1
    });
    $("#gameScreen").css({
        'z-index': -500,
        'opacity': 0
    });
    // First, load profile data from cookies
    loadProfileJSON();
    // Prepare records
    prepRecords();
    //prepPlayerStats(profiles[0]);
    playerProfiles = [null, null, null, null];
    panelColors = [-1, -1, -1, -1];
    menuMode = ["", 0];
    updateUI();
}

function playerPanelClicked(id) {
    if (menuMode[0] == "" && panelColors[id] == -1) {
        menuMode = ["addPlayer", id];
        $("#select_player_box_text" + id).text("Selecting...");
        profilePage = 0;
        showProfilePanel();
    } else if (menuMode[0] == "" && panelColors[id] != -1) {
        // Set color of player panel without causing overlaps
        var c = (panelColors[id] + 1) % totalColors;
        while (arrayContains(panelColors, c)) {
            c = (c + 1) % totalColors;
        }
        panelColors[id] = c;
    }
    updateUI();
}

function profilePanelClicked(id) {
    if (menuMode[0] == "addPlayer") {
        // If the player profile already exists
        if (profilePage * 5 + id < profiles.length) {
            var playerID = menuMode[1];
            // Set color of player panel without causing overlaps
            var c = 0;
            while (arrayContains(panelColors, c)) {
                c = (c + 1) % totalColors;
            }
            panelColors[playerID] = c;
            // Set player profile
            playerProfiles[playerID] = profiles[5 * profilePage + id];
            // Animate out gray overlay
            /*$("#select_player_overlay" + playerID).css({
                opacity: 0
            });*/
            menuMode = ["", 0];
            hideProfilePanel();
            exitNamePanel(playerID);
        }
        // New profile?
        else if (profilePage * 5 + id == profiles.length) {
            // Animate in profile creation panel
            showNewProfile();
        }
    }
    updateUI();
}

function changeProfilePage(delta) {
    var totalPages = (Math.ceil((profiles.length + 1) / 5));
    profilePage += (delta + totalPages);
    profilePage = profilePage % totalPages;
    updateUI();
}

function setUIColor(id) {
    if (uiColor != id) {
        uiColor = id;
        for (var i = 0; i < 100; i++) {
            $(".color_light").removeClass("anim_color_l" + i);
            $(".color_dark").removeClass("anim_color_d" + i);
        }
        $(".color_light").addClass("anim_color_l" + id);
        $(".color_dark").addClass("anim_color_d" + id);
        setTimeout(function () {
            for (var i = 0; i < 100; i++) {
                $(".color_light").removeClass("color_l" + i);
                $(".color_dark").removeClass("color_d" + i);
            }
            $(".color_light").removeClass("anim_color_l" + id);
            $(".color_dark").removeClass("anim_color_d" + id);
            $(".color_light").addClass("color_l" + id);
            $(".color_dark").addClass("color_d" + id);
        }, 250);
    }
}

function freezeClicked(id) {
    // Check for legal move
    var legalMove = true;
    // Long Jump Run-up Phase: freeze total cannot exceed 8
    if (eventID == 1 && setNumber == 1) {
        if (dice[id] + freezeSum > 8) {
            legalMove = false;
        }
    }
    // Discus: only even dice can be frozen
    if (eventID == 6) {
        if (dice[id] % 2 == 1) {
            legalMove = false;
        }
    }
    // Javelin: only odd dice can be frozen
    if (eventID == 8) {
        if (dice[id] % 2 == 0) {
            legalMove = false;
        }
    }
    // Freeze die marked "id" and remove button
    if (id < frozen.length && !disableClicks && legalMove && freezeButtons) {
        // If the freeze is valid...
        if (!frozen[id]) {
            frozen[id] = true;
            exitFreezeSingle(id);
            // Long Jump and Discus: must freeze at least one die per reroll
            if (eventID == 1 || eventID == 6 || eventID == 8) {
                rerolls = 1;
            }
            updateDice();
            freezeSum += dice[id];
            if (eventID == 1 || eventID == 6 || eventID == 8) {
                displayFreezeTotal();
            }
            // Stop telling user to freeze
            exitFreezeMessage();
        }
    }
    updateUI();
}

function displayFreezeTotal() {
    // Fade out
    exitFreezeDisplay();
    disableClicks = true;
    // Set text
    setTimeout(function () {
        if (eventID == 1) {
            $("#gamearea_buttons_display_freeze").text("❄ " + freezeSum + "/8");
        } else if (eventID == 6 || eventID == 8) {
            $("#gamearea_buttons_display_freeze").text("❄ " + freezeSum);
        }
    }, 150);
    // Fade in
    setTimeout(function () {
        enterFreezeDisplay();
    }, 200);
    setTimeout(function () {
        disableClicks = false;
    }, 300);
}

function Player(id_, name_, isAI_, playerColor_, profile_) {
    this.id = id_;
    this.name = name_;
    this.isAI = isAI_;
    this.playerColor = playerColor_;
    this.scores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.totalScore = 0;
    this.roundScore = 0;
    this.showRoundScore = false;
    this.profile = profile_;
}

function Profile(props) {
    this.name = props.name;
    this.bestScores = props.bestScores || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.eventRanks = props.eventRanks || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.highScore = props.highScore || 0;
    this.highScoreEventScores = props.highScoreEventScores || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.getStars = function () {
        // Get rank of each individual event
        this.eventRanks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < 10; i++) {
            var goalScores = eventRankData[i];
            this.eventRanks[i] = getEventRank(this.bestScores[i], goalScores);
        }
        // Determine star count
        var stars = 0;
        for (var i = 0; i < 10; i++) {
            if (this.eventRanks[i] >= 5) {
                stars += (this.eventRanks[i] - 4);
            }
        }
        return stars;
    }
    this.getEventTotal = function () {
        var total = 0;
        for (var i = 0; i < 10; i++)
            total += this.bestScores[i];
        return total;
    }
    this.getTotalScore = function () {
        var total = 0;
        total += this.getEventTotal();
        total += this.highScore;
        total += this.getStars();
        return total;
    }
    this.exportString = function () {
        var str = "";
        str += this.name;
        str += "|";
        for (var i = 0; i < 10; i++) {
            str += this.bestScores[i];
            if (i < 9) str += ",";
        }
        str += "|";
        str += this.highScore;
        str += "|";
        for (var i = 0; i < 10; i++) {
            str += this.highScoreEventScores[i];
            if (i < 9) str += ",";
        }
        return str;
    }
}

function loadProfileJSON() {
    var profileJSON = localStorage.getItem("decathlon");
    if (profileJSON) {
        var profileList = JSON.parse(profileJSON);
        for (var i = 0; i < profileList.length; i++) {
            profiles.push(new Profile(profileList[i]));
        }
        console.log(profileList);
    }
}

function saveGame() {
    var jsonProfiles = JSON.stringify(profiles);
    localStorage.setItem("decathlon", jsonProfiles);
}

function addNewProfile() {
    var name = $("#new_profile_field").val();
    // If empty, go back
    if (name.length == 0) {
        hideNewProfile();
    }
    // Else, make a new profile with the name
    else {
        profiles.push(new Profile({
            name: name
        }));
        hideNewProfile();
        updateUI();
        // Save the game to remember the new profile!
        saveGame();
    }
}

function clearData() {
    profiles = [];
    saveGame();
    updateUI();
}

function tick() {
    // Die roll effect
    for (var i = 0; i < dice.length; i++) {
        if (rollingDice && !frozen[i]) {
            setDie(i, 1 + Math.floor(Math.random() * 6));
        }
    }
    // Count down points
    if (tickPoints) {
        // Check to see if anyone has points that need to be scored
        var pointsToScore = false;
        for (var i = 0; i < players.length; i++) {
            if (players[i].roundScore != 0) {
                // Need to score more points
                pointsToScore = true;
                // Score points
                if (players[i].roundScore > 0) {
                    players[i].roundScore -= 1;
                    players[i].totalScore += 1;
                } else {
                    players[i].roundScore += 1;
                    players[i].totalScore -= 1;
                }
            } else {
                // Points don't need to be scored
                if (!tickPointsFinished[i]) {
                    // If the finishing animation hasn't been played yet, do that
                    tickPointsFinished[i] = true;
                    hideRoundScore(i);
                }
            }
        }
        // If everyone's done, go to next round
        if (!pointsToScore && !roundEnded) {
            roundEnded = true;
            setTimeout(function () {
                exitMessage();
            }, 250);
            setTimeout(function () {
                tickPoints = false;
                if (roundNumber < 9) {
                    roundNumber++;
                    prepRound();
                } else {
                    endGame();
                }
            }, 500);
        }
        updateUI();
    }
}

function showRoundScore(id) {
    $("#ui_score_roundScore" + id).removeClass("roundScore_down_anim");
    $("#ui_score_roundScore" + id).addClass("roundScore_up_anim");
    $("#ui_score_totalScore" + id).removeClass("totalScore_center_anim");
    $("#ui_score_totalScore" + id).addClass("totalScore_left_anim");
}

function hideRoundScore(id) {
    $("#ui_score_roundScore" + id).removeClass("roundScore_up_anim");
    $("#ui_score_roundScore" + id).addClass("roundScore_down_anim");
    $("#ui_score_totalScore" + id).removeClass("totalScore_left_anim");
    $("#ui_score_totalScore" + id).addClass("totalScore_center_anim");
}

function animateStartGame() {
    // Fade in
    $("#bigCover").css("z-index", 100000);
    $("#bigCover").addClass("bigCover_fade_in_anim");
    setTimeout(function () {
        $("#bigCover").css("z-index", -100000);
        $("#titleScreen").css({
            'z-index': -500,
            'opacity': 0
        });
        $("#gameScreen").css({
            'z-index': 500,
            'opacity': 1
        });
        $(".ui_score").css({
            'z-index': 500,
            'opacity': 1
        });
        $(".ui_score").removeClass("ui_score_exit_anim");
        $("#ui_round_bar").removeClass("ui_round_bar_exit_anim");
        $("#gamearea").removeClass("gamearea_exit_anim");
        $(".ui_score").addClass("ui_score_enter_anim");
        $("#ui_round_bar").addClass("ui_round_bar_enter_anim");
        $("#gamearea").addClass("gamearea_enter_anim");
        prepGame();
    }, 500);
    setTimeout(function () {
        newGame();
    }, 1500);
}

function prepGame() {
    soloGame = false;
    buttonStatus = false;
    roundNumber = 0;
    setGameBodyScreen(1, false);
    exitFreeze();
    // TODO: remove this
    roundNumber = 0;
    events = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    players = [];
    for (var i = 0; i < 4; i++) {
        if (playerProfiles[i] != null) {
            players.push(new Player(i, playerProfiles[i].name, false, panelColors[i], playerProfiles[i]));
        }
    }
    // Personal Best
    if (players.length == 1) {
        soloGame = true;
        players.push(new Player(1, "Your Best", false, 8, null));
    }
    updateUI();
}

function newGame() {
    prepRound();
    updateUI();
}

// Prepares a round, before actually starting it
function prepRound() {
    turn = 0;
    enterMessage("Event " + (roundNumber + 1));
    setTimeout(function () {
        exitMessage();
    }, 1750);
    setTimeout(function () {
        startRound();
    }, 2000);
}

function startRound() {
    // Reset showRoundScore
    for (var i = 0; i < players.length; i++) {
        players[i].showRoundScore = false;
    }
    // Solo game: display best round score
    if (soloGame) {
        // TODO: set this number to what the player got in their best run
        scorePoints(1, players[0].profile.highScoreEventScores[roundNumber]);
    }
    // eventID is the number of the event as listed in eventNames above, not the actual round number (if randomized).
    eventID = events[roundNumber];
    // 100 Meters
    if (eventID == 0) {
        dice = [0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false];
        turn = 0;
        freezeButtons = false;
    }
    // Long Jump
    else if (eventID == 1) {
        dice = [0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false, false];
        turn = 0;
        freezeButtons = true;
    }
    // Shot Put
    else if (eventID == 2) {
        dice = [0, 0, 0, 0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [true, true, true, true, true, true, true, true];
        turn = 0;
        freezeButtons = false;
    }
    // High Jump
    else if (eventID == 3) {
        dice = [0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false, false];
        turn = 0;
        freezeButtons = false;
        goalHeight = 10;
        activePlayers = [];
        for (var i = 0; i < players.length; i++) {
            activePlayers.push(true);
        }
    }
    // 400 Meters
    else if (eventID == 4) {
        dice = [0, 0];
        diceSum = 0;
        frozen = [false, false];
        turn = 0;
        freezeButtons = false;
    }
    // 110 Meter Hurdles
    else if (eventID == 5) {
        dice = [0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false, false];
        turn = 0;
        freezeButtons = false;
    }
    // Discus
    else if (eventID == 6) {
        dice = [0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false, false];
        turn = 0;
        freezeButtons = true;
    }
    // Pole Vault
    else if (eventID == 7) {
        dice = [0, 0, 0, 0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [true, true, true, true, true, true, true, true];
        turn = 0;
        freezeButtons = false;
        goalHeight = 10;
        activePlayers = [];
        for (var i = 0; i < players.length; i++) {
            activePlayers.push(true);
        }
        updateDice();
    }
    // Javelin
    else if (eventID == 8) {
        dice = [0, 0, 0, 0, 0, 0];
        diceSum = 0;
        frozen = [false, false, false, false, false, false];
        turn = 0;
        freezeButtons = true;
    }
    // 1500 Meters
    else if (eventID == 9) {
        dice = [0];
        diceSum = 0;
        frozen = [false];
        turn = 0;
        freezeButtons = false;
    }
    // Set event high scores
    // Top 3 of all time
    var bestScores = highScores[eventID];
    console.log(bestScores);
    for (var i = 0; i < 3; i++) {
        if (i < bestScores.length) {
            var name = bestScores[i][0];
            var score = bestScores[i][1];
            var rank = getEventRank(score, eventRankData[eventID]);
            $("#gamerecords_box_name" + i).text(name);
            $("#gamerecords_box_score" + i).text(score);
            $("#gamerecords_box_rank" + i).text(toOrdinal(i + 1) + " / " + rankLetters[rank]);
        } else {
            $("#gamerecords_box_name" + i).text("-----");
            $("#gamerecords_box_score" + i).text("--");
            $("#gamerecords_box_rank" + i).text("-----");
        }
    }
    // Personal bests for players
    var numPlayers = 1;
    if (!soloGame) {
        numPlayers = players.length;
    }
    for (var i = 0; i < 4; i++) {
        if (i < players.length && players[i].profile) {
            var name = players[i].profile.name;
            var score = players[i].profile.bestScores[eventID];
            var place = getHighScorePlace(score, bestScores);
            var rank = getEventRank(score, eventRankData[eventID]);
            $("#gamerecords_pb_name" + i).text(name);
            $("#gamerecords_pb_score" + i).text(score);
            $("#gamerecords_pb_rank" + i).text(toOrdinal(place) + " / " + rankLetters[rank]);
            $("#gamerecords_pb" + i).css({
                "opacity": 1,
                "left": (2.5 + 25 * i + 12.5 * (4 - numPlayers)) + "%"
            });
        } else {
            $("#gamerecords_pb_name" + i).text("-----");
            $("#gamerecords_pb_score" + i).text("--");
            $("#gamerecords_pb_rank" + i).text("-----");
            $("#gamerecords_pb" + i).css("opacity", 0);
            console.log("opacity 0");
        }
    }
    // Set event rules
    $("#gamehelp_body_text").html(eventRules[eventID]);
    prepTurn();
    updateUI();
}

// Prepares a turn, before actually starting it
function prepTurn() {
    if (!soloGame) {
        // Not a solo game, display turns normally
        enterMessage(players[turn].name + "'s Turn");
        setTimeout(function () {
            exitMessage();
        }, 1250);
        setTimeout(function () {
            startTurn();
        }, 1500);
    } else {
        // Skip the turn display
        setTimeout(function () {
            startTurn();
        }, 100);
    }
}

function startTurn() {
    // 100 Meters
    if (eventID == 0) {
        setNumber = 1;
        sets = 2;
        rerolls = 5;
        lives = -1;
    }
    // Long Jump
    else if (eventID == 1) {
        setNumber = 1;
        sets = 2;
        rerolls = 0;
        lives = 3;
    }
    // Shot Put
    else if (eventID == 2) {
        setNumber = 1;
        sets = 1;
        rerolls = 0;
        lives = 3;
    }
    // High Jump
    else if (eventID == 3) {
        setNumber = 1;
        sets = 1;
        rerolls = 0;
        lives = 3;
    }
    // 400 Meters
    else if (eventID == 4) {
        setNumber = 1;
        sets = 4;
        rerolls = 5;
        lives = -1;
    }
    // 110 Meter Hurdles
    else if (eventID == 5) {
        setNumber = 1;
        sets = 1;
        rerolls = 5;
        lives = -1;
    }
    // Discus
    else if (eventID == 6) {
        setNumber = 1;
        sets = 1;
        rerolls = 0;
        lives = 3;
    }
    // Pole Vault
    else if (eventID == 7) {
        setNumber = 1;
        sets = 1;
        rerolls = 0;
        lives = 3;
        diceToRoll = Math.ceil(goalHeight / 6.0);
    }
    // Javelin
    else if (eventID == 8) {
        setNumber = 1;
        sets = 1;
        rerolls = 0;
        lives = 3;
    }
    // 1500 Meters
    else if (eventID == 9) {
        setNumber = 1;
        sets = 8;
        rerolls = 5;
        lives = -1;
    }
    startSet();
    updateUI();
}

function startSet() {
    // Reset dice
    $(".gamearea_dice_box_die").css({
        'background-image': 'url(dice/die0.svg)'
    });
    for (var i = 0; i < dice.length; i++) {
        dice[i] = 0;
        // Unfreeze all dice EXCEPT in Long Jump, Jump Phase, in which case all dice invert frozen state
        if (eventID == 1 && setNumber == 2) {
            frozen[i] = !frozen[i];
        } else if (eventID != 7) {
            frozen[i] = false;
        }
    }
    enterDice();
    updateDice();
    setTimeout(function () {
        for (var i = 0; i < dice.length; i++) {
            $("#gamearea_dice_box_die" + i).css({
                opacity: 1
            });
        }
    }, 500);
    diceSum = 0;
    freezeSum = 0;
    $("#gamearea_buttons_display").text("");
    // 100 Meters
    if (eventID == 0) {
        leftOption = "roll";
        rightOption = "accept";
        updateUI();
    }
    // Long Jump
    else if (eventID == 1) {
        leftOption = "roll";
        rightOption = "accept";
        rerolls = 0;
        freezeSum = 0;
        displayFreezeTotal();
        updateUI();
    }
    // Shot Put
    else if (eventID == 2) {
        leftOption = "addroll";
        rightOption = "accept";
        rerolls = 0;
        frozen = [true, true, true, true, true, true, true, true];
        toRoll = 0;
        updateUI();
        updateDice();
    }
    // High Jump
    else if (eventID == 3) {
        leftOption = "attempt";
        rightOption = "skip";
        rerolls = 0;
        updateUI();
        updateDice();
    }
    // 400 Meters
    else if (eventID == 4) {
        leftOption = "roll";
        rightOption = "accept";
        updateUI();
    }
    // 110 Meter Hurdles
    else if (eventID == 5) {
        leftOption = "roll";
        rightOption = "accept";
        updateUI();
    }
    // Discus
    else if (eventID == 6) {
        leftOption = "roll";
        rightOption = "accept";
        rerolls = 0;
        freezeSum = 0;
        displayFreezeTotal();
        updateUI();
    }
    // Pole Vault
    else if (eventID == 7) {
        leftOption = "attempt";
        rightOption = "skip";
        rerolls = 0;
        updateUI();
        updateDice();
    }
    // Javelin
    else if (eventID == 8) {
        leftOption = "roll";
        rightOption = "accept";
        rerolls = 0;
        freezeSum = 0;
        displayFreezeTotal();
        updateUI();
    }
    // 1500 Meters
    else if (eventID == 9) {
        leftOption = "roll";
        rightOption = "accept";
        updateUI();
    }
    enterButtons();
    enterInfoText();
    // Set display
    // If Long Jump during Run-up Phase, or Discus, or Javelin, use the freeze counter instead
    if ((eventID == 1 && setNumber == 1) || eventID == 6 || eventID == 8) {
        $("#gamearea_buttons_display").addClass("hide");
        $("#gamearea_buttons_display_freeze").removeClass("hide");
    } else {
        $("#gamearea_buttons_display").removeClass("hide");
        $("#gamearea_buttons_display_freeze").addClass("hide");
    }
}

function updateUI() {
    // Menu
    // Selection text
    $(".select_player_box_text").text("+ Add Player");
    if (menuMode[0] == "addPlayer") {
        $("#select_player_box_text" + menuMode[1]).text("Selecting...");
    }
    // Set player select panels to their chosen colors
    for (var i = 0; i < panelColors.length; i++) {
        for (var j = 0; j < totalColors + 1; j++) {
            $("#select_player_panel" + i).removeClass("color_d" + j);
            $("#select_player_name" + i).removeClass("color_l" + j);
            $("#select_player_rank" + i).removeClass("color_l" + j);
        }
        $("#select_player_panel" + i).addClass("color_d" + panelColors[i]);
        $("#select_player_name" + i).addClass("color_l" + panelColors[i]);
        $("#select_player_rank" + i).addClass("color_l" + panelColors[i]);
        // Set name and star count of selected profile
        if (playerProfiles[i] != null) {
            $("#select_player_name_text" + i).text(playerProfiles[i].name);
            $("#select_player_rank_text" + i).text(playerProfiles[i].getTotalScore());
        }
    }
    // Non-selected panels have grayed overlay
    for (var i = 0; i < 4; i++) {

    }
    // Profile selection panel
    // List profile names
    for (var i = 0; i < 5; i++) {
        var n = 5 * profilePage + i;
        if (n < profiles.length) {
            $("#player_list_text" + i).text(profiles[n].name);
            $("#player_list_panel" + i).css({
                opacity: 1
            });
        } else if (n == profiles.length) {
            $("#player_list_text" + i).text("+ Add Profile");
            $("#player_list_panel" + i).css({
                opacity: 1
            });
        } else if (n > profiles.length) {
            $("#player_list_text" + i).text("");
            $("#player_list_panel" + i).css({
                opacity: 0
            });
        }
    }
    // Profile list page numbers
    $("#player_list_pagenum").text((profilePage + 1) + "/" + (Math.ceil((profiles.length + 1) / 5)));
    // Game
    if (players.length > 0) {
        // Colors
        // UI colors change to current player colors
        if (players[turn].playerColor != uiColor) {
            setUIColor(players[turn].playerColor);
        }
        // Player colors are fixed throughout
        for (var i = 0; i < players.length; i++) {
            $(".color_p" + i).addClass("color_d" + players[i].playerColor);
            $(".color_p" + i + "_l").addClass("color_l" + players[i].playerColor);
        }
        // Move player UI
        var p = players.length;
        for (var i = 0; i < 4; i++) {
            var leftPos = 12.5 * (4 - p) + 25 * i;
            $("#ui_score" + i).css({
                'left': leftPos + "%"
            });
            if (i < p) {
                $("#ui_score" + i).css({
                    opacity: 1
                });
            } else {
                $("#ui_score" + i).css({
                    opacity: 0
                });
            }
        }
        // Score UI first
        for (var i = 0; i < players.length; i++) {
            if (i == turn) {
                $("#ui_score_name" + i + ">.ui_score_name_text").text("• " + players[i].name + " •");
            } else {
                $("#ui_score_name" + i + ">.ui_score_name_text").text(players[i].name);

            }
            $("#ui_score_totalScore" + i + ">.ui_score_totalScore_text").text(players[i].totalScore);
            if (players[i].roundScore >= 0) {
                $("#ui_score_roundScore" + i + ">.ui_score_roundScore_text").text("+" + players[i].roundScore);
            } else {
                $("#ui_score_roundScore" + i + ">.ui_score_roundScore_text").text(players[i].roundScore);
            }
            // Showing round score?
            if (!players[i].showRoundScore && players[i].roundScore != 0) {
                showRoundScore(i);
                players[i].showRoundScore = true;
            }
        }
        // Top bar
        $(".ui_round_bar_circle").removeClass("active_round_anim");
        $("#ui_round_bar_circle" + roundNumber).addClass("active_round_anim");
        $("#ui_round_bar_tab_text").text(eventNames[events[roundNumber]]);
        var tabPos = 8 * roundNumber;
        $("#ui_round_bar_tab").css({
            left: tabPos + "%"
        });
        // Game area display info
        if (eventID == 0 || eventID == 4 || eventID == 5 || eventID == 9) {
            // 100 Meters and 400 Meters and 110 Meter Hurdles and 1500 Meters
            $("#gamearea_info_left").text("Set " + setNumber + " of " + sets);
            $("#gamearea_info_right").text("⟳ x " + rerolls);
        } else if (eventID == 1) {
            // Long Jump
            $("#gamearea_info_left").text("Attempt " + (4 - lives) + " of " + 3);
            var rightText;
            if (setNumber == 1) rightText = "Run-up Phase"
            if (setNumber == 2) rightText = "Jump Phase"
            $("#gamearea_info_right").text(rightText);
        } else if (eventID == 2) {
            // Shot Put
            $("#gamearea_info_left").text("Attempt " + (4 - lives) + " of " + 3);
            $("#gamearea_info_right").text("");
        } else if (eventID == 3 || eventID == 7) {
            // High Jump and Pole Vault
            $("#gamearea_info_left").text("Height " + goalHeight);
            $("#gamearea_info_right").text("♥ x " + lives);
        } else if (eventID == 6 || eventID == 8) {
            // Discus
            $("#gamearea_info_left").text("Attempt " + (4 - lives) + " of " + 3);
            $("#gamearea_info_right").text("");
        }
        // Dice boxes
        var d = dice.length;
        for (var i = 0; i < 8; i++) {
            var leftPos = 6.25 * (8 - d) + 12.5 * i;
            $("#gamearea_dice_box" + i).css({
                'left': leftPos + "%"
            });
            if (i < d) {
                $("#gamearea_dice_box" + i).css({
                    opacity: 1
                });
            } else {
                $("#gamearea_dice_box" + i).css({
                    opacity: 0
                });
            }
        }

        // Dispel illegal freeze moves
        // Long Jump, Run-up Phase: frozen dice total cannot exceed 8
        if (eventID == 1 && setNumber == 1) {
            var legalMoves = false;
            for (var i = 0; i < dice.length; i++) {
                if (!frozen[i] && freezeSum + dice[i] > 8) {
                    exitFreezeSingle(i);
                } else if (!frozen[i]) {
                    legalMoves = true;
                }
            }
            // If there are no legal freeze moves, forfeit
            if (!legalMoves && rerolls == 0) {
                rightOption = "forfeit";
            }
        }
        // Discus: only even dice can be frozen
        if (eventID == 6) {
            var legalMoves = false;
            for (var i = 0; i < dice.length; i++) {
                if (!frozen[i] && dice[i] % 2 == 1) {
                    exitFreezeSingle(i);
                } else if (!frozen[i]) {
                    legalMoves = true;
                }
            }
            // If there are no legal freeze moves, forfeit
            if (!legalMoves && rerolls == 0) {
                rightOption = "forfeit";
            }
        }
        // Javelin: only odd dice can be frozen
        if (eventID == 8) {
            var legalMoves = false;
            for (var i = 0; i < dice.length; i++) {
                if (!frozen[i] && dice[i] % 2 == 0) {
                    exitFreezeSingle(i);
                } else if (!frozen[i]) {
                    legalMoves = true;
                }
            }
            // If there are no legal freeze moves, forfeit
            if (!legalMoves && leftOption == "reroll" && rerolls == 0) {
                rightOption = "forfeit";
            }
        }

        // Special dice buttons for Pole Vault
        var z = -1000;
        if (eventID == 7) {
            z = 100;
        }
        $("#gamearea_dice_buttons").css({
            'z-index': z
        });

        // Game area buttons
        if (leftOption == "roll") {
            $("#gamearea_buttons_left_text").text("Roll");
        } else if (leftOption == "reroll") {
            $("#gamearea_buttons_left_text").text("⟳ Reroll");
        } else if (leftOption == "addroll") {
            $("#gamearea_buttons_left_text").text("+ Roll New");
        } else if (leftOption == "attempt") {
            $("#gamearea_buttons_left_text").text("✓ Attempt");
        }
        if (rightOption == "accept") {
            if (eventID == 1 && setNumber == 1) {
                $("#gamearea_buttons_right_text").text("✓ Jump");
            } else {
                $("#gamearea_buttons_right_text").text("✓ Accept");
            }
        } else if (rightOption == "forfeit") {
            $("#gamearea_buttons_right_text").text("✕ Forfeit");
        } else if (rightOption == "skip") {
            $("#gamearea_buttons_right_text").text("✕ Skip");
        } else if (rightOption == "continue") {
            $("#gamearea_buttons_right_text").text("➔ Continue");
        } else if (rightOption == "end") {
            $("#gamearea_buttons_right_text").text("✕ End Turn");
        }

        // Block buttons in certain cases
        toBlockLeft = false;
        toBlockRight = false;
        // If the player is out of rerolls, they cannot reroll
        if (leftOption == "reroll" && rerolls == 0) {
            toBlockLeft = true;
        }
        // If all dice are frozen, the player cannot reroll
        if (leftOption == "reroll" && allTrue(frozen)) {
            toBlockLeft = true;
        }
        // In Shot Put, the player cannot roll a new die if all 8 are rolled or if a 1 is rolled
        if (eventID == 2 && leftOption == "addroll" && toRoll > 0) {
            if (toRoll > 7 || arrayContains(dice, 1)) {
                toBlockLeft = true;
            }
        }
        // In High Jump, player cannot attempt if they have no lives or have already won
        if (leftOption == "attempt" && (rightOption == "continue" || rightOption == "end") && (lives == 0 || diceSum >= goalHeight)) {
            toBlockLeft = true;
        }
        // If the player has yet to roll, they cannot accept
        if (leftOption == "roll" && rightOption == "accept") {
            toBlockRight = true;
        }
        // In Long Jump, player cannot accept if they have not frozen (i.e. have no rerolls)
        if ((eventID == 1 || eventID == 6 || eventID == 8) && leftOption == "reroll" && rightOption == "accept" && rerolls < 1) {
            toBlockRight = true;
        }
        // In Long Jump, player cannot finish the Jump Phase if all dice are not yet frozen
        if (eventID == 1 && setNumber == 2 && !allTrue(frozen)) {
            toBlockRight = true;
        }
        // In Shot Put, player cannot accept without rolling
        if (eventID == 2 && rightOption == "accept" && toRoll == 0) {
            toBlockRight = true;
        }
        // In High Jump, player cannot continue until winning
        if (eventID == 3 && rightOption == "continue" && diceSum < goalHeight) {
            toBlockRight = true;
        }
        // Carry out block/unblock
        if (toBlockLeft) {
            blockLeft();
        } else {
            unblockLeft();
        }
        if (toBlockRight) {
            blockRight();
        } else {
            unblockRight();
        }
        // Results screen
        // Move player UI
        var p = players.length;
        for (var i = 0; i < 4; i++) {
            var leftPos = 12.5 * (4 - p) + 25 * i;
            $(".panel" + i).css({
                'left': leftPos + "%"
            });
            if (i < p) {
                $(".panel" + i).css({
                    opacity: 1
                });
            } else {
                $(".panel" + i).css({
                    opacity: 0
                });
            }
        }
    }
}

function rollDice() {
    // Actual internal roll
    for (var i = 0; i < dice.length; i++) {
        // If die is not frozen:
        if (!frozen[i]) {
            dice[i] = 1 + Math.floor(Math.random() * 6);
            rollingDice = true;
            $("#gamearea_dice_box_die" + i).addClass("die_roll_anim");
        }
    }
    // Animation
    disableClicks = true;
    exitDisplay();
    setTimeout(function () {
        for (var i = 0; i < dice.length; i++) {
            rollingDice = false;
            setDie(i, dice[i]);
            $("#gamearea_dice_box_die" + i).removeClass("die_roll_anim");
        }
        disableClicks = false;
    }, 500);
    setTimeout(function () {
        enterDisplay();
    }, 400);
    // Total dice
    var total = 0;
    var multiplier = 1;
    for (var i = 0; i < dice.length; i++) {
        total += dice[i];
        // Sixes negative in 100/400/1500 Meters
        if (dice[i] == 6 && (eventID == 0 || eventID == 4 || eventID == 9)) {
            total -= 12;
        }
        // Shot Put and Pole Vault: getting a 1 sets score to 0
        if ((eventID == 2 || eventID == 7) && dice[i] == 1) {
            multiplier = 0;
        }
    }
    total *= multiplier;
    diceSum = total;
    setTimeout(function () {
        $("#gamearea_buttons_display").text(diceSum);
    }, 250);
    setTimeout(function () {
        for (var i = 0; i < dice.length; i++) {
            if (freezeButtons && dice[i] > 0 && !frozen[i]) {
                enterFreezeSingle(i);
            }
        }
        if (eventID == 1 || eventID == 6 || eventID == 8) {
            enterFreezeMessage();
        }
        updateUI();
    }, 500);
    // High Jump: fail attempt check
    if (lives == 0 && diceSum < goalHeight) {
        rightOption = "end";
    }
}

function setDie(id, value) {
    // Don't show freeze effect in Shot Put
    if (frozen[id] && (eventID != 2 || dice[id] == 0)) {
        $("#gamearea_dice_box_die" + id).css({
            'background-image': 'url(dice/freeze' + value + '.svg)'
        });
    } else {
        $("#gamearea_dice_box_die" + id).css({
            'background-image': 'url(dice/die' + value + '.svg)'
        });
    }
}

function updateDice() {
    // Pole Vault die adding/removing
    if (eventID == 7) {
        for (var i = 0; i < dice.length; i++) {
            frozen[i] = (i >= diceToRoll);
            if (i >= diceToRoll) {
                dice[i] = 0;
            }
        }
    }
    for (var i = 0; i < dice.length; i++) {
        setDie(i, dice[i]);
    }
}

function acceptRoll() {
    scorePoints(turn, diceSum);
    exitDice();
    if (!(eventID == 1 && setNumber == 1)) {
        exitDisplay();
    } else {

    }
    exitFreeze();
    setTimeout(function () {
        if (setNumber < sets) {
            // Still more sets
            setNumber++;
            startSet();
        } else {
            // Turn over
            endTurn();
        }
        updateUI();
    }, 250);
}

function startJumpPhase() {
    exitDice();
    if (!(eventID == 1 && setNumber == 1)) {
        exitDisplay();
    } else {

    }
    exitFreeze();
    exitFreezeDisplay();
    setTimeout(function () {
        $("#gamearea_buttons_display_freeze").text("");
    }, 100);
    setTimeout(function () {
        setNumber = 2;
        startSet();
        updateUI();
    }, 250);
}

function acceptAttempt() {
    if (eventID == 6 || eventID == 8) {
        scoreAttempt(turn, freezeSum);
    } else {
        scoreAttempt(turn, diceSum);
    }
    exitDice();
    if (!(eventID == 1 && setNumber == 1)) {
        exitDisplay();
    } else {

    }
    exitFreeze();
    exitFreezeDisplay();
    $("#gamearea_buttons_display_freeze").text("");
    setTimeout(function () {
        if (lives > 1) {
            // Still more attempts
            lives--;
            setNumber = 1;
            startSet();
        } else {
            // Turn over
            endTurn();
        }
        updateUI();
    }, 250);
}

function forfeitAttempt() {
    // Player cannot make any moves in Long Jump, Discus, or Javelin events, and must restart the attempt
    exitFreezeMessage();
    exitFreezeDisplay();
    $("#gamearea_buttons_display_freeze").text("");
    exitDice();
    if (!(eventID == 1 && setNumber == 1)) {
        exitDisplay();
    } else {

    }
    exitFreeze();
    setTimeout(function () {
        if (lives > 1) {
            // Still more attempts
            lives--;
            setNumber = 1;
            startSet();
        } else {
            // Turn over
            endTurn();
        }
        updateUI();
    }, 250);
}

function addDie() {
    frozen[toRoll] = false;
    rollDice();
    setTimeout(function () {
        frozen[toRoll] = true;
        toRoll++;
        updateDice();
        updateUI();
    }, 500);
}

function attemptHeight() {
    leftOption = "attempt";
    rightOption = "continue";
    lives -= 1;
    rollDice();
    updateUI();
}

function skipHeight() {
    // Check for remaining players
    if (!soloGame) {
        if (!allFalse(activePlayers)) {
            // Some players left
            turn++;
            while (!activePlayers[turn]) {
                turn++;
                if (turn > players.length) {
                    turn = 0;
                    goalHeight += 2;
                }
            }
            setTimeout(function () {
                prepTurn();
                rightOption = "skip";
                updateUI();
            }, 250);
        } else {
            endTurn();
        }
    } else {
        if (activePlayers[0]) {
            // Some players left
            goalHeight += 2;
            setTimeout(function () {
                prepTurn();
                rightOption = "skip";
                updateUI();
            }, 250);
        } else {
            endTurn();
        }
    }
    exitDice();
    exitDisplay();
    exitFreeze();
    exitFreezeDisplay();
    exitButtons();
    updateUI();

}

function passHeight() {
    scoreAttempt(turn, goalHeight);
    skipHeight();
}

function failHeight() {
    activePlayers[turn] = false;
    skipHeight();
}

function plusOneDie() {
    if (diceToRoll < 8) {
        diceToRoll++;
        updateDice();
    }
}

function minusOneDie() {
    if (diceToRoll > Math.ceil(goalHeight / 6.0)) {
        diceToRoll--;
        updateDice();
    }
}

function exitDisplay() {
    $("#gamearea_buttons_display").removeClass("display_enter_anim");
    $("#gamearea_buttons_display").addClass("display_exit_anim");
}

function enterDisplay() {
    $("#gamearea_buttons_display").removeClass("display_exit_anim");
    $("#gamearea_buttons_display").addClass("display_enter_anim");
}

function exitMessage() {
    $("#gamearea_message").removeClass("message_enter_anim");
    $("#gamearea_message").addClass("message_exit_anim");
}

function enterMessage(message) {
    $("#gamearea_message").text(message);
    $("#gamearea_message").removeClass("message_exit_anim");
    $("#gamearea_message").addClass("message_enter_anim");
}

function exitDice() {
    $(".gamearea_dice_box_die").removeClass("die_enter_anim");
    $(".gamearea_dice_box_die").addClass("die_exit_anim");
}

function enterDice() {
    $(".gamearea_dice_box_die").removeClass("die_exit_anim");
    $(".gamearea_dice_box_die").addClass("die_enter_anim");
    setTimeout(function () {
        $(".gamearea_dice_box_die").removeClass("die_enter_anim");
    }, 500);
}

function exitDie(id) {
    $("#gamearea_dice_box_die" + id).removeClass("die_enter_anim");
    $("#gamearea_dice_box_die" + id).addClass("die_exit_anim");
}

function enterDie(id) {
    $("#gamearea_dice_box_die" + id).removeClass("die_exit_anim");
    $("#gamearea_dice_box_die" + id).addClass("die_enter_anim");
    setTimeout(function () {
        $("#gamearea_dice_box_die" + id).removeClass("die_enter_anim");
    }, 500);
}

function exitButtons() {
    if (buttonStatus == true) {
        buttonStatus = false;
        $(".gamearea_button").removeClass("button_enter_anim");
        $(".gamearea_button").addClass("button_exit_anim");
        // High Jump
        if (eventID == 7) {
            $("#gamearea_dice_buttons").removeClass("button_enter_anim");
            $("#gamearea_dice_buttons").addClass("button_exit_anim");
        }
        setTimeout(function () {
            $(".gamearea_button").css("z-index", -10000);
        }, 250);
    }
}

function enterButtons() {
    if (buttonStatus == false) {
        buttonStatus = true;
        $(".gamearea_button").removeClass("button_exit_anim");
        $(".gamearea_button").addClass("button_enter_anim");
        // High Jump
        if (eventID == 7) {
            $("#gamearea_dice_buttons").removeClass("button_exit_anim");
            $("#gamearea_dice_buttons").addClass("button_enter_anim");
        }
        $(".gamearea_button").css("z-index", 100);
    }
}

// Info text and freeze share the same (non-moving fade) as the buttons
function exitInfoText() {
    $(".gamearea_info_text").removeClass("button_enter_anim");
    $(".gamearea_info_text").addClass("button_exit_anim");
}

function enterInfoText() {
    $(".gamearea_info_text").removeClass("button_exit_anim");
    $(".gamearea_info_text").addClass("button_enter_anim");
}

function exitFreeze() {
    $(".gamearea_dice_box_freeze").removeClass("button_enter_anim");
    $(".gamearea_dice_box_freeze").addClass("button_exit_anim");
}

function enterFreeze() {
    $(".gamearea_dice_box_freeze").removeClass("button_exit_anim");
    $(".gamearea_dice_box_freeze").addClass("button_enter_anim");
}

function exitFreezeSingle(id) {
    $("#gamearea_dice_box_freeze" + id).removeClass("button_enter_anim");
    $("#gamearea_dice_box_freeze" + id).addClass("button_exit_anim");
}

function enterFreezeSingle(id) {
    $("#gamearea_dice_box_freeze" + id).removeClass("button_exit_anim");
    $("#gamearea_dice_box_freeze" + id).addClass("button_enter_anim");
}

function scorePoints(id, pts) {
    players[id].roundScore += pts;
    updateUI();
}

function scoreAttempt(id, pts) {
    if (pts > players[id].roundScore) {
        players[id].roundScore = pts;
    }
    updateUI();
}

function exitFreezeMessage() {
    $("#gamearea_freeze_message").removeClass("button_enter_anim");
    $("#gamearea_freeze_message").addClass("button_exit_anim");
}

function enterFreezeMessage() {
    if (eventID == 1 && setNumber == 1) {
        $("#gamearea_freeze_message").text("Freeze at least one die without exceeding a total of 8.");
    } else if (eventID == 1 && setNumber == 2) {
        $("#gamearea_freeze_message").text("Freeze at least one die.");
    } else if (eventID == 6) {
        $("#gamearea_freeze_message").text("Freeze at least one even die.");
    } else if (eventID == 8) {
        $("#gamearea_freeze_message").text("Freeze at least one odd die.");
    }
    $("#gamearea_freeze_message").removeClass("button_exit_anim");
    $("#gamearea_freeze_message").addClass("button_enter_anim");
}

function exitFreezeDisplay() {
    $("#gamearea_buttons_display_freeze").removeClass("display_freeze_enter_anim");
    $("#gamearea_buttons_display_freeze").addClass("display_freeze_exit_anim");
}

function enterFreezeDisplay() {
    $("#gamearea_buttons_display_freeze").removeClass("display_freeze_exit_anim");
    $("#gamearea_buttons_display_freeze").addClass("display_freeze_enter_anim");
}

function blockLeft() {
    $("#gamearea_buttons_left_invalid").removeClass("blocker_exit_anim");
    $("#gamearea_buttons_left_invalid").addClass("blocker_enter_anim");
}

function unblockLeft() {
    $("#gamearea_buttons_left_invalid").removeClass("blocker_enter_anim");
    $("#gamearea_buttons_left_invalid").addClass("blocker_exit_anim");
}

function blockRight() {
    $("#gamearea_buttons_right_invalid").removeClass("blocker_exit_anim");
    $("#gamearea_buttons_right_invalid").addClass("blocker_enter_anim");
}

function unblockRight() {
    $("#gamearea_buttons_right_invalid").removeClass("blocker_enter_anim");
    $("#gamearea_buttons_right_invalid").addClass("blocker_exit_anim");
}

function showProfilePanel() {
    $("#player_list").removeClass("profile_panel_left_anim");
    $("#player_list").addClass("profile_panel_right_anim");
    $("#player_info").removeClass("player_panel_right_anim");
    $("#player_info").addClass("player_panel_left_anim");
}

function hideProfilePanel() {
    $("#player_list").addClass("profile_panel_left_anim");
    $("#player_list").removeClass("profile_panel_right_anim");
    $("#player_info").removeClass("player_panel_left_anim");
    $("#player_info").addClass("player_panel_right_anim");
}

function enterNamePanel(id) {
    $("#select_player_topbar" + id).removeClass("overlay_top_exit_anim");
    $("#select_player_topbar" + id).addClass("overlay_top_enter_anim");
    $("#select_player_bottombar" + id).removeClass("overlay_bottom_exit_anim");
    $("#select_player_bottombar" + id).addClass("overlay_bottom_enter_anim");
    $("#select_player_box" + id).removeClass("overlay_box_exit_anim");
    $("#select_player_box" + id).addClass("overlay_box_enter_anim");
}

function exitNamePanel(id) {
    $("#select_player_topbar" + id).addClass("overlay_top_exit_anim");
    $("#select_player_topbar" + id).removeClass("overlay_top_enter_anim");
    $("#select_player_bottombar" + id).addClass("overlay_bottom_exit_anim");
    $("#select_player_bottombar" + id).removeClass("overlay_bottom_enter_anim");
    $("#select_player_box" + id).addClass("overlay_box_exit_anim");
    $("#select_player_box" + id).removeClass("overlay_box_enter_anim");
}

function showNewProfile() {
    $("#new_profile").removeClass("new_profile_left_anim");
    $("#new_profile").addClass("new_profile_right_anim");
    $("#new_profile_field").val("");
    $("#new_profile_field").select();
}

function hideNewProfile() {
    $("#new_profile").addClass("new_profile_left_anim");
    $("#new_profile").removeClass("new_profile_right_anim");
}

function endTurn() {
    // Dice and buttons leave play area
    exitDice();
    exitButtons();
    exitInfoText();
    exitFreeze();
    exitFreezeMessage();
    if (turn + 1 < players.length && !soloGame) {
        // More players need to take their turn
        setTimeout(function () {
            turn++;
            prepTurn();
            updateUI();
        }, 250);
    } else {
        // New round
        endRound();
    }
}

function endRound() {
    // Display "Event Over" message
    setTimeout(function () {
        enterMessage("Event Over");
        // Check for new scores first
        var isNewHighScore = false;
        var newHighScores = [false, false, false, false];
        for (var i = 0; i < (soloGame ? 1 : players.length); i++) {
            // Record round score
            players[i].scores[roundNumber] = players[i].roundScore;
            // Check for new high score
            if (players[i].roundScore > players[i].profile.bestScores[roundNumber]) {
                isNewHighScore = true;
                newHighScores[i] = true;
            }
        }
        // If there are any new high scores, play the new high score animation
        if (isNewHighScore) {
            // Fade game area to 50%
            $("#gamearea").removeClass("gamearea_fade_full_anim");
            $("#gamearea").addClass("gamearea_fade_half_anim");
            for (var i = 0; i < (soloGame ? 1 : players.length); i++) {
                if (newHighScores[i]) {
                    // Apply animation
                    $("#ui_score" + i).removeClass("ui_score_new_record_out_anim");
                    $("#ui_score" + i).addClass("ui_score_new_record_anim");
                    // Set text fields to reflect old/new scores/ranks
                    $("#ui_score_newHighScore_oldScore" + i).text(players[i].profile.bestScores[roundNumber]);
                    $("#ui_score_newHighScore_newScore" + i).text(players[i].roundScore);
                    $("#ui_score_newHighScore_oldRank" + i).text(rankLetters[getEventRank(players[i].profile.bestScores[roundNumber], eventRankData[roundNumber])]);
                    $("#ui_score_newHighScore_newRank" + i).text(rankLetters[getEventRank(players[i].roundScore, eventRankData[roundNumber])]);
                    // Set high score to new score
                    players[i].profile.bestScores[roundNumber] = players[i].roundScore;
                    // In a few seconds, hide the high score panel
                    setTimeout(function (id) {
                        $("#ui_score" + id).removeClass("ui_score_new_record_anim");
                        $("#ui_score" + id).addClass("ui_score_new_record_out_anim");
                    }, 5000, i);
                }
            }
            saveGame();
            // Fade game area to 100%
            setTimeout(function () {
                $("#gamearea").removeClass("gamearea_fade_half_anim");
                $("#gamearea").addClass("gamearea_fade_full_anim");
                startTickPoints();
            }, 5000);
        } else {
            startTickPoints();
        }
    }, 250);
}

function startTickPoints() {
    // Score points in tick function
    tickPoints = true;
    tickPointsFinished = [];
    for (var i = 0; i < players.length; i++) {
        tickPointsFinished.push(false);
    }
    roundEnded = false;
}

function endGame() {
    // Record scores
    for (var i = 0; i < (soloGame ? 1 : players.length); i++) {
        // New high score?
        if (players[i].totalScore > players[i].profile.highScore) {
            players[i].profile.highScore = players[i].totalScore;
            for (var j = 0; j < 10; j++) {
                players[i].profile.highScoreEventScores[j] = players[i].scores[j];
            }
        }
    }
    saveGame();
    // Give message
    enterMessage("That's it!");
    setTimeout(function () {
        exitMessage();
    }, 1500);
    setTimeout(function () {
        fadeToResults();
    }, 2000);
}

function fadeToResults() {
    // Exit game screen
    $(".ui_score").removeClass("ui_score_enter_anim");
    $("#ui_round_bar").removeClass("ui_round_bar_enter_anim");
    $("#gamearea").removeClass("gamearea_enter_anim");
    $(".ui_score").addClass("ui_score_exit_anim");
    $("#ui_round_bar").addClass("ui_round_bar_exit_anim");
    $("#gamearea").addClass("gamearea_exit_anim");
    // Enter results screen
    $("#results_title").css("opacity", 0);
    $("#results_panels").css("opacity", 0);
    $("#results_continue").css("opacity", 0);
    setTimeout(function () {
        $("#resultsScreen").css({
            'z-index': 10000,
            'opacity': 1
        });
        // Enter results title
        $("#results_title").addClass("results_title_in_anim");
    }, 500);
    setTimeout(function () {
        // Enter results panels
        for (var i = 0; i < 4; i++) {
            $(".panel" + i).css({
                "top": "70%",
                "height": "30%"
            });
            if (players[i] != null) {
                $("#results_panel_name" + i).text(players[i].name);
            }
            $("#results_panel_score" + i).text("0");
        }
        $("#results_panels").addClass("results_panels_in_anim");
    }, 1500);
    setTimeout(function () {
        animateFinalScores();
    }, 2500);
    setTimeout(function () {
        $("#results_continue").addClass("results_continue_in_anim");
    }, 3500);
}

function animateFinalScores() {
    var scores = [0, 0, 0, 0];
    for (var i = 0; i < players.length; i++) {
        scores[i] = players[i].totalScore;
    }
    var names = ["Alice", "Bob", "Cat", "Dave"];
    var max = maxElement(scores);
    if (max == 0)
        max = 1;
    for (var i = 0; i < 4; i++) {
        // Reset position to 0
        $(".panel" + i).css({
            "top": "70%",
            "height": "30%"
        });
        // Compute bar height
        var h = 70 * (scores[i] / max) + 30
            // Set name and score display
            //$("#results_panel_name" + i).text(names[i]);
        $("#results_panel_score" + i).text("0");
        // Animate to final score
        $("#results_panel" + i).animate({
            "top": (100 - h) + "%",
            "height": h + "%"
        }, {
            duration: (1000 * scores[i] / max),
            progress: function (animation, progress) {
                var id = betterParseInt(this.id);
                $("#results_panel_score" + id).text(Math.round(progress * scores[id]));
            }
        });
        $("#results_panel_text" + i).animate({
            "top": (100 - h) + "%"
        }, {
            duration: (1000 * scores[i] / max)
        });
    }
}

function exitResults() {
    $("#resultsScreen").css({
        'z-index': -10000,
        'opacity': 0
    });
}

function prepRecords() {
    // Sort high scores
    sortHighScores();
    for (var i = 0; i < 10; i++) {
        // Set event title
        $("#records_event_title" + i).text(eventNames[i]);
        // Set high score text
        for (var j = 0; j < Math.min(3, highScores[i].length); j++) {
            $("#records_event_name" + (j + 1) + "_" + i).text(highScores[i][j][0]);
            $("#records_event_score" + (j + 1) + "_" + i).text(highScores[i][j][1]);
        }
    }
    // Lower sections
    for (var i = 0; i < Math.min(5, bestRuns.length); i++) {
        $("#records_section_name" + (i + 1) + "_0").text(bestRuns[i][0]);
        $("#records_section_score" + (i + 1) + "_0").text(bestRuns[i][1]);
    }
    for (var i = 0; i < Math.min(5, mostStars.length); i++) {
        $("#records_section_name" + (i + 1) + "_1").text(mostStars[i][0]);
        $("#records_section_score" + (i + 1) + "_1").text(mostStars[i][1]);
    }
    for (var i = 0; i < Math.min(5, mostStars.length); i++) {
        $("#records_section_name" + (i + 1) + "_2").text(highestRatings[i][0]);
        $("#records_section_score" + (i + 1) + "_2").text(highestRatings[i][1]);
    }
}

function prepPlayerStats(profile) {
    for (var i = 0; i < 10; i++) {
        // Set event title
        $("#playerstats_scores_event_title" + i).text(eventNames[i]);
        $("#playerstats_scores_event_score" + i).text(profile.bestScores[i]);
        $("#playerstats_scores_event_rank" + i).text(rankLetters[profile.eventRanks[i]]);
    }
    $("#playerstats_scores_scoresum_score").text(profile.getEventTotal());
    $("#playerstats_scores_bestrun_score").text(profile.highScore);
    $("#playerstats_scores_starcount_score").text(profile.getStars());
    $("#playerstats_scores_rating_score").text(profile.getTotalScore());
}

function showPlayerStatsScreen(n) {
    $("#playerstats_box").animate({
        'left': (n * -100) + "%"
    }, 250);
}

function setGameBodyScreen(n, doAnimation) {
    gameBodyScreen = n;
    if (doAnimation) {
        $("#gamebody").animate({
            'left': ((n - 1) * -100) + "%"
        }, 250);
    } else {
        $("#gamebody").css({
            'left': ((n - 1) * -100) + "%"
        });
    }
}

function sortHighScores() {
    // Clear high score array
    highScores = [];
    for (var i = 0; i < 10; i++) {
        var eventHighScores = [];
        // Get all players' high scores
        for (var j = 0; j < profiles.length; j++) {
            var scorePair = [];
            scorePair[0] = profiles[j].name;
            scorePair[1] = profiles[j].bestScores[i];
            eventHighScores.push(scorePair);
        }
        // Sort them
        eventHighScores.sort(function (a, b) {
            return b[1] - a[1];
        });
        // Add to high score array
        highScores.push(eventHighScores);
    }
    // Best runs
    bestRuns = [];
    // Get all players' high scores
    for (var i = 0; i < profiles.length; i++) {
        var scorePair = [];
        scorePair[0] = profiles[i].name;
        scorePair[1] = profiles[i].highScore;
        bestRuns.push(scorePair);
    }
    // Sort them
    bestRuns.sort(function (a, b) {
        return b[1] - a[1];
    });
    // Most stars
    mostStars = [];
    // Get all players' high scores
    for (var i = 0; i < profiles.length; i++) {
        var scorePair = [];
        scorePair[0] = profiles[i].name;
        scorePair[1] = profiles[i].getStars();
        mostStars.push(scorePair);
    }
    // Sort them
    mostStars.sort(function (a, b) {
        return b[1] - a[1];
    });
    // Ratings
    highestRatings = [];
    // Get all players' high scores
    for (var i = 0; i < profiles.length; i++) {
        var scorePair = [];
        scorePair[0] = profiles[i].name;
        scorePair[1] = profiles[i].getTotalScore();
        highestRatings.push(scorePair);
    }
    // Sort them
    highestRatings.sort(function (a, b) {
        return b[1] - a[1];
    });
    // Add to high score array
    console.log(highScores);
    console.log(bestRuns);
    console.log(mostStars);
    console.log(highestRatings);
}

function betterParseInt(s) {
    var str = s + "";
    while (isNaN(parseInt(str)) && str.length > 0) {
        str = str.substring(1, str.length);
    }
    return parseInt(str);
}

function allTrue(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (!arr[i]) {
            return false;
        }
    }
    return true;
}

function allFalse(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i]) {
            return false;
        }
    }
    return true;
}

function arrayContains(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value)
            return true;
    }
    return false;
}

function getEventRank(score, goalScores) {
    var rank = 0;
    while (score >= goalScores[rank] && rank <= goalScores.length) {
        rank++;
    }
    return rank;
}

function getHighScorePlace(score, highScores) {
    for (var i = 0; i < highScores.length; i++) {
        if (score == highScores[i][1]) {
            return i + 1;
        }
    }
}

function toOrdinal(n) {
    if (n == undefined) {
        return "???";
    } else if (n % 10 == 1 && n % 100 != 11) {
        return n + "st";
    } else if (n % 10 == 2 && n % 100 != 12) {
        return n + "nd";
    } else if (n % 10 == 3 && n % 100 != 13) {
        return n + "rd";
    } else if (n > 0) {
        return n + "th";
    }
}

function maxElement(list) {
    var max = list[0];
    for (var i = 1; i < list.length; i++) {
        if (list[i] > max) {
            max = list[i];
        }
    }
    return max;
}

// Create list of achievements
function makeAchievementList() {

}
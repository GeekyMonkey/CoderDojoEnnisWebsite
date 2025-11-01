var openNewWindow = function(url)
{
    window.open(url);
}

var onPageShow = function()
{
    // FormSave button just submits the form that's on the same page
    $("div.pagerole").on("click", "a.FormSave", function (e) {
        e.preventDefault();
        var form = $(this).closest("div.pagerole").find("form");
        if (form.length == 0) {
            console.log("Form save clicked, but form not found");
        }
        form.submit();
    });

    // Focus the first input on all pages with forms
    setTimeout(function () {
        $('form :input.AutoFocus:visible').first().focus();
    }, 10);

    // Hide missing images
    $("img[data-src]").each(function () {
        $(this).error(function () {
            $(this).hide();
        });
        $(this).attr("src", $(this).data("src"));
        $(this).attr("data-src", null);
    });
}

/* jQuery Startup */
$(function () {
    onPageShow();

    $(document).on('pageshow', 'div.pagerole', function (event, ui) {
        onPageShow();
    });

    // Disable caching of some pages
    $(document).on('pagehide', 'div.pagerole', function (event, ui) {
        if (ui.nextPage && ui.nextPage[0] && $(ui.nextPage[0]).is('.ui-dialog')) {
            return;
        }
        var page = jQuery(event.target);
        if (page.attr('data-cache') == 'never') {
            page.remove();
        };
    });
});



function initAttendancePage() {
    var updateAttendanceCount = function () {
        var count = $(":checkbox:checked").length;
        $("#TotalAttendanceNumber").html(count);
    }

    $(":checkbox").off().on("change", function () {
        var checkbox = $(this);
        var checked = checkbox.is(':checked');
        updateAttendanceCount();

        // Prevent multiple calls of the same value
        var checkedString = '*' + checked;
        if ($(this).data("sentcheck", checked) != checkedString) {
            $(this).data("sentcheck", checked, checkedString);
            var memberId = checkbox.attr("id").substr(1);
            window.settingAttendanceMemberId = memberId;
            $.ajax("AttendanceChange", {
                type: "POST",
                data: {
                    memberId: memberId,
                    present: checked,
                    attendanceDate: $("#AttendanceDateSelect").val()
                }
            });
        }
    });

    $("#AttendanceDateSelect").off("change").on("change", function (e) {
        var dateSelected = $("#AttendanceDateSelect").val();
        window.location = "/Mentor/Attendance?attendanceDate=" + dateSelected;
    });

    // Start the SignalR connection
    $.connection.hub.start().done(function () {
    });

    // Receive a notification that someone altered attendance
    $.connection.attendanceHub.client.onAttendanceChange = function (attendanceDate, memberId, memberName, teamId, present, sessionCount, dojoAttendanceCount, memberMessage, memberImageUrl) {
        if ($("#AttendanceDateSelect").length) {
            if ($("#AttendanceDateSelect").val() == attendanceDate) {
                var checkbox = $("#P" + memberId);
                present = present == "true";
                var newChecked = present;
                if (window.settingAttendanceMemberId != memberId) {
                    // Attendance change came from other mentor
                } else {
                    // Attendance change came from current mentor
                    displayMemberWelcome(memberId, present, sessionCount, memberMessage);
                }
                var li = checkbox.closest("li");
                var oldBackgroundColor = li.css("background-color");
                li.find(".ui-btn-inner").css("transition", "background-color 0.05s").css("background-color", "yellow")
                setTimeout(function () {
                    checkbox.prop("checked", newChecked).checkboxradio("refresh")
                    updateAttendanceCount();
                    li.find(".ui-btn-inner").css("transition", "background-color 0.5s").css("background-color", oldBackgroundColor)
                }, 50);
            }
        }
    };

    var displayMemberWelcome = function (memberId, present, sessionCount, memberMessage)
    {
        if (present) {
            var checkbox = $("#P" + memberId);
            var memberName = checkbox.closest("li").find("label").text();
            $("#MemberMessages").html(memberMessage);
            $("#WelcomeDetailsButton").attr("href", "/Mentor/Member/" + memberId + "?PreviousPage=Attendance");
            $("#MemberWelcomeDialog").popup("open"/*, { positionTo: "#P" + memberId }*/)
            $("#MemberWelcomeDialog").off("click").on("click", ".CloseButton", function () {
                $("#MemberWelcomeDialog").popup("close");
            });
        }
    }
}

var integerSuffix = function (n) {
    var d = (n | 0) % 100;
    return d > 3 && d < 21 ? 'th' : ['th', 'st', 'nd', 'rd'][d % 10] || 'th';
}

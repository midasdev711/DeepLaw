$(window).on("load", function() {
    $(".loader").delay(1000).fadeOut("slow");
});

$(document).ready(function() {
    $("#currentYear").text((new Date()).getFullYear());
    attachTopScroller(".scrollUp");
    drawDashboardChart();
});

function attachTopScroller (elementId){
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $(elementId).fadeIn();
        } else {
            $(elementId).fadeOut();
        }
    });
    // Scroll To Top Animation
    $(elementId).click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, 1000);
        return false;
    });
};

function drawDashboardChart(){
    var ctx = document.getElementById("myChart");
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          datasets: [{
            data: [15339, 21345, 18483, 24003, 23489, 24092, 12034],
            lineTension: 0,
            backgroundColor: 'transparent',
            borderColor: '#007bff',
            borderWidth: 4,
            pointBackgroundColor: '#007bff'
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: false
              }
            }]
          },
          legend: {
            display: false,
          }
        }
    });
}
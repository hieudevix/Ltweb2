(function ($) {
  "use strict"; // Start of use strict

  //TaiLoc - Layout Fixed
  if ($(window).width() < 768) {
    $("#content-wrapper").removeAttr("style");
    $("#content-wrapper").attr("style", "padding-left: 100px");
    $('.sidebar .collapse').collapse('hide');
    $("#side-menu").removeClass("sidenav-menu");
    $(".navbar-brand").removeClass("style");
    $(".btn-icon-size").attr("style", "margin-top: .7rem;");
  }
  else {
    $("#content-wrapper").attr("style", "padding-left: 225px");
    $("#side-menu").addClass("sidenav-menu");
    $(".navbar-brand").attr("style", "width: 15rem;");
  };

  // Toggle the side navigation - TaiLoc Fixed
  $("#sidebarToggle, #sidebarToggleTop").on('click', function (e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $(".sidenav-footer").addClass("d-none");
      $('.sidebar .collapse').collapse('hide');
      $("#content-wrapper").attr("style", "padding-left: 100px");
      $("#side-menu").removeClass("sidenav-menu");
      $(".navbar-brand").removeAttr("style");
    };

    if (!$(".sidebar").hasClass("toggled")) {
      $(".sidenav-footer").removeClass("d-none");
      $("#content-wrapper").removeAttr("style");
      $("#content-wrapper").attr("style", "padding-left: 225px");
      $("#side-menu").addClass("sidenav-menu");
      $(".navbar-brand").attr("style", "width: 15rem;");

      if ($(window).width() < 768) {
        $("#side-menu").removeClass("sidenav-menu");
        $(".navbar-brand").removeAttr("style");
      };
    };

    if ($(window).width() < 768) {
      $("#content-wrapper").removeAttr("style");
      if (!$(".sidebar").hasClass("toggled")) {
        $("#content-wrapper").attr("style", "padding-left: 100px");
      };
    }
  });

  // btnView_Edit - TaiLoc
  $("#btnView_Edit").on("click", function (e) {
    if ($(".editField").is("[readonly]")) { //checks if it is already on readonly mode
      $(".editField").prop("readonly", false);//turns the readonly off
      $(".editSelectField").removeAttr("disabled");
      $("#btnView_Edit").attr("style", "display:none;");
      $(".view_avatar").removeAttr("style");
      $(".btnView_Save").removeAttr("disabled");
      $(".btnView_Save").attr("style", "display:inline;");
    } else { //else we do other things
      $(".editField").prop("readonly", true);
    }
  });

  // Fix Layout when click icon nav top - TaiLoc
  $("#alertsDropdown, #messagesDropdown, #userDropdown, #searchDropdown").on('click', function (e) {
    if ($(window).width() < 768 && !$(".sidebar").hasClass("toggled")) {
      $("body").addClass("sidebar-toggled");
      $(".sidebar").addClass("toggled");
      $('.sidebar .collapse').collapse('hide');
      $("#content-wrapper").removeAttr("style");
    };
  });

  //TaiLoc - Layout Fixed
  // Close any open menu accordions when window is resized below 768px and over 768px
  $(window).resize(function () {
    if ($(window).width() < 768) {
      $("#content-wrapper").removeAttr("style");
      $("#content-wrapper").attr("style", "padding-left: 100px");
      $('.sidebar .collapse').collapse('hide');
      $("#side-menu").removeClass("sidenav-menu");
      $(".navbar-brand").removeAttr("style");
      $(".btn-icon-size").attr("style", "margin-top: .7rem;");
    }
    else {
      $("#content-wrapper").attr("style", "padding-left: 225px");
      $("body").toggleClass("sidebar-toggled");
      $(".sidebar").toggleClass("toggled");
      $("#side-menu").addClass("sidenav-menu");
      $(".navbar-brand").attr("style", "width: 15rem;");
      $(".btn-icon-size").removeAttr("style");
      if ($(".sidebar").hasClass("toggled")) {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
      };
    };

    if ($(window).width() < 768 && $(".sidebar").hasClass("toggled")) {
      $("#content-wrapper").removeAttr("style");
      //$("#side-menu").removeClass("sidenav-menu");
    }

    // Toggle the side navigation when window is resized below 480px
    if ($(window).width() < 480 && !$(".sidebar").hasClass("toggled")) {
      $("body").addClass("sidebar-toggled");
      $(".sidebar").addClass("toggled");
      $('.sidebar .collapse').collapse('hide');
    };

  });

  //Preview img upload
  function readURLAvatar(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      
      reader.onload = function(e) {
        $('#imgAvatar').attr('src', e.target.result);
      }
      
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }

  function readURLImgId(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      
      reader.onload = function(e) {
        $('#imgId').attr('src', e.target.result);
        $('#imgId-modal').attr('src', e.target.result);
      }
      
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  
  $("#avatar").change(function() {
    readURLAvatar(this);
  });

  $("#ImgId").change(function() {
    readURLImgId(this);
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function (e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function () {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function (e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

})(jQuery); // End of use strict

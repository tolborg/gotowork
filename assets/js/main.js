var options = {
  url: "https://docs.google.com/spreadsheets/d/1tWWwogBq0JY19daDRZ8CtqAXi1qQS3ImGLJ-aS6dYBM/edit#gid=",
  sheets: {
    below30: {
      single: "0", unmarried: "330639646", married: "1592350983"
    },
    above30: {
      single: "1935201683", unmarried: "1864558929", married: "1453903659"
    },
    assumptions: "1202341758",
    details: {
      a: "1083702273",
      b: "8124"
    }
  },
  columns: {
    c000: "B", c100: "C", c110: "D", c010: "E", c011: "F", c111: "G", c101: "H", c001: "I"
  },
  order: [
    'age', 'civil_status', 'children_count', 'child_care_1', 'child_care_2', 'child_care_3', 'salary_value'
  ],
  data: {
    age: "a",
    civil_status: "a",
    children_count: "a",
    child_care_1: "a",
    child_care_2: "a",
    child_care_3: "a",
    salary_value: "18000"
  },
  result: {
    benefits: "",
    salary: ""
  }
};



var app = {

  init: function () {
    app.watchData();
    app.watchResult();
    app.handleChildren();
    app.tabs();
    app.radios();
    app.postAssumptions();

    $(document).on("change", "#form [name]", function () {
      app.updateDataFromForm();
    });

    // Perform correct actions based on hash existence
    var hash = window.location.hash.substring(1);

    console.log(hash);

    if (hash == "") {
      app.updateForm();
      app.updateResult();
    }
    else {
      app.updateDataFromHash();
    }
  },


  watchData: function () {
    watch(options.data, function (prop, action, newvalue, oldvalue) {
      app.distributeData();
    });
  },


  watchResult: function () {
    watch(options.result, function (prop, action, newvalue, oldvalue) {
      if (prop == "benefits") {
        $("#output .output__benefits .output__value").text(newvalue + " kr.");
      }
      else if (prop == "salary") {
        $("#output .output__salary .output__value").text(newvalue + " kr.");
      }
    });
  },


  handleChildren: function () {
    $(document).on("change", "#form input[name='children_count']", function() {
      var $input = $(this);
      var hideTargets = $input.attr("data-hide");
      var showTargets = $input.attr("data-show");

      if (typeof hideTargets != 'undefined') {
        var hideTargetsArray = hideTargets.split("-");
        $.each(hideTargetsArray, function(i, v) {
          var $target = $('[name="child_care_' + v + '"');
          $target.closest(".form__input").addClass("hidden");
          $target.val("a").trigger("change");
        });
      }
      if (typeof showTargets != 'undefined') {
        var showTargetsArray = showTargets.split("-");
        $.each(showTargetsArray, function(i, v) {
          var $target = $('[name="child_care_' + v + '"');
          $target.closest(".form__input").removeClass("hidden");
        });
      }
    });

    // $(document).on({
    //   focus: function () {
    //     $(this).data("prev", $(this).val());
    //   },
    //   change: function () {
    //     var $input = $(this);
    //     var $input_siblings = $input.closest(".form__inputs").find("select").not($input);

    //     if ($input.val() != "a") {
    //       $input_siblings.find("option[value='" + $input.val() + "']").attr('disabled','disabled');
    //     }
    //     else {
    //       $input_siblings.find("option[value='" + $input.data("prev") + "']").removeAttr('disabled');
    //     }
    //   }
    // }, "#form [name='child_care_1'], #form [name='child_care_2'], #form [name='child_care_3']");
  },


  distributeData: function () {
    app.updateForm();
    app.updateHash();
    app.updateResult();
  },


  updateForm: function () {
    $.each(options.order, function (i, n) {
      var $input = $("[name='" + n + "']");

      if ($input.is("input[type='radio']")) {
        console.log("what?");
        $input.filter('[value="'+ options.data[n] +'"]').prop("checked", true).trigger("change");
      }
      if ($input.is("select")) {
        $input.val(options.data[n]).trigger("change");
      }
    });
  },


  updateHash: function () {
    var hashArray = [];

    $.each(options.order, function (i, n) {
      hashArray[i] = options.data[n];
    });

    window.location.hash = hashArray.join(",");
  },


  updateDataFromForm: function () {
    var newdata = {};

    $.each(options.order, function (i, n) {
      var $input = $("[name='" + n + "']");

      if ($input.is("input[type='radio']")) {
        newdata[n] = $input.filter(":checked").val();
      }
      if ($input.is("select")) {
        newdata[n] = $input.val();
      }
    });

    $.extend(options.data, newdata);
  },


  updateDataFromHash: function () {
    var hash = window.location.hash.substring(1);
    var hashArray = hash.split(",");
    var newdata = {};

    if (!hashArray[0] == "") {
      $.each(options.order, function (i, n) {
        if (typeof hashArray[i] != 'undefined') {
          newdata[n] = hashArray[i];
        }
      });
    }

    $.extend(options.data, newdata);
  },


  updateResult: function () {
    var sheet = app.getSheet();
    var column = app.getColumn();

    sheetrock({
      url: sheet,
      query: "select " + column + " where A = 1",
      reset: true,
      callback: function (error, shOptions, response) {
        if (!error) {
          options.result.benefits = response.raw.table.rows[0].c[0].f;
        }
      }
    });

    sheetrock({
      url: sheet,
      query: "select " + column + " where A = " + options.data.salary_value,
      reset: true,
      callback: function (error, shOptions, response) {
        if (!error) {
          options.result.salary = response.raw.table.rows[0].c[0].f;
        }
      }
    });
  },


  getSheet: function () {
    if (options.data.age == "a") {
      if (options.data.civil_status == "a") {
        return options.url + options.sheets.below30.single;
      }
      else if (options.data.civil_status == "b") {
        return options.url + options.sheets.below30.unmarried;
      }
      else if (options.data.civil_status == "c") {
        return options.url + options.sheets.below30.married;
      }
    }
    else if (options.data.age == "b") {
      if (options.data.civil_status == "a") {
        return options.url + options.sheets.above30.single;
      }
      else if (options.data.civil_status == "b") {
        return options.url + options.sheets.above30.unmarried;
      }
      else if (options.data.civil_status == "c") {
        return options.url + options.sheets.above30.married;
      }
    }
  },

  getColumn: function () {
    var columnArray = [];

    if (options.data.child_care_1 == "b" || options.data.child_care_2 == "b" || options.data.child_care_3 == "b") {
      columnArray[0] = "1";
    }
    else {
      columnArray[0] = "0";
    }
    if (options.data.child_care_1 == "c" || options.data.child_care_2 == "c" || options.data.child_care_3 == "c") {
      columnArray[1] = "1";
    }
    else {
      columnArray[1] = "0";
    }
    if (options.data.child_care_1 == "d" || options.data.child_care_2 == "d" || options.data.child_care_3 == "d") {
      columnArray[2] = "1";
    }
    else {
      columnArray[2] = "0";
    }
    return options.columns["c" + columnArray.join("")];
  },

  postAssumptions: function () {
    // $("#assumptions table").sheetrock({
    //   // url: options.url + options.sheets.assumptions
    //   url: options.url + options.sheets.details.a

    // });



  },

  tabs: function () {

    $(document).on("click", ".tabs__trigger", function (e) {
      e.preventDefault();
      $clickedTrigger = $(this);
      $allTriggers = $clickedTrigger.closest("li").siblings().find("a");
      $allSections = $clickedTrigger.closest(".tabs").find(".tabs__section");
      $targetSection = $allSections.filter("[data-tab-section='" + $clickedTrigger.attr("data-tab-trigger") + "']");

      $allTriggers.removeClass("tabs__trigger--active");
      $clickedTrigger.addClass("tabs__trigger--active");
      $allSections.removeClass("tabs__section--active");
      $targetSection.addClass("tabs__section--active");
    });

    $(document).on("click", ".details__close", function (e) {
      e.preventDefault();
      $("#details").addClass("hidden");
    });

    $(document).on("click", ".details__open", function (e) {
      e.preventDefault();
      $("#details").removeClass("hidden");
    });

  },

  radios: function () {

    $(document).on("change", "input[type='radio']", function () {
      console.log($(this));
      var $parent = $(this).closest(".form__input");
      var $uncles = $parent.siblings();

      $uncles.removeClass("checked");
      $parent.addClass("checked");
      // var $uncles = $parent.siblings();

      // $uncles.removeClass("checked");
      // $parent.addClass("checked");



      // console.log($(this));
    });

    // $('input[type="radio"]').each(function (i, $radio) {
    //   // var $label
    //   // console.log($radio);
    //   // var label = $radio.prev().text;



    // });


  }

};

$(document).ready(app.init);







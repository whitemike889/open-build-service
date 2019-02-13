function setupPopover() {
  $('[data-toggle="popover"]').popover({ trigger: 'hover click' });
}

function setAllLinks(event) {
  $(this).closest('.dropdown-menu').find('input').prop('checked', event.data.checked);
}

function statusCell(packageName, meta, statusHash, tableInfo, project) {
  var info = tableInfo[meta.col-1];
  var repository = info[0];
  var architecture = info[1];
  var status = statusHash[repository][architecture][packageName] || {};
  var code = status.code;
  if (code === undefined) { return null; }

  var id = meta.row + '-' + meta.col;
  var details = status.details;
  var output = '<a ';
  var klass = 'build-state-' + code;

  if (['succeeded', 'failed', 'building'].includes(code)) {
    var url = '/package/live_build_log/' + project + '/' + packageName + '/' + repository + '/' + architecture;
    output += 'href="' + url + '"';
  }
  else {
    output += 'href="javascript:void(0);"';
    output += ' id="' + id + '"';

    if (details !== undefined) {
      if (code === 'scheduled') klass = 'text-warning';
      output += ' data-content="' + details + '" data-placement="right" data-toggle="popover"';
    }
  }
  output += ' class="' + klass + '">' + code + '</a>';
  return output;
}

function setupProjectMonitor() { // jshint ignore:line
  var data = $('tbody').data();
  var packageNames = data.packagenames;
  var statusHash =data.statushash;
  var tableInfo = data.tableinfo;
  var project = data.project;

  initializeDataTable('#project-monitor-table', { // jshint ignore:line
    scrollX: true,
    fixedColumns: true,
    pageLength: 50,
    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
    data: packageNames,
    search: {
      regex: true,
      smart: false,
    },
    columnDefs: [
      {
        width: 150,
        targets: 0,
        className: 'text-left',
        data: null,
        render: function (packageName) {
          var url = '/package/show/' + project + '/' + packageName;
          return '<a href="' + url + '">' + packageName + '</a>';
        }
      },
      {
        targets: '_all',
        data: null,
        className: 'text-center',
        render: function (packageName, type, row, meta) {
          return statusCell(packageName, meta, statusHash, tableInfo, project);
        }
      }
    ]
  });

  $('#table-spinner').addClass('d-none');
  $('#project-monitor .obs-dataTable').removeClass('invisible');

  $('#filter-button').on('click', function () {
    $('#table-spinner').removeClass('d-none');
  });

  $('#project-monitor-table').on('draw.dt', function () {
    setupPopover();
  });

  setupPopover();

  $('.monitor-no-filter-link').on('click', { checked: false }, setAllLinks);

  $('.monitor-filter-link').on('click', { checked: true }, setAllLinks);

  $('.dropdown-menu.keep-open').on('click', function (e) {
    e.stopPropagation();
  });
}

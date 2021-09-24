
$(document).ready(function() {
    var fileCatcher = document.getElementById('file-catcher');
    var fileInput = document.getElementById('file-input');
    
    var fileList = [];
    
    fileCatcher.addEventListener('submit', (evnt) => {
        evnt.preventDefault();
        $('#response-list').empty();
        $('#for-spinner').append($('<div />').addClass('loader'));
        var status = {
            current: 0,
            total:fileList.length
        }
        fileList.forEach(function (file) {
            sendFile(file, status);
        });
    });
    
    fileInput.addEventListener('change', (evnt) => {
        fileList = [];
        for (var i = 0; i < fileInput.files.length; i++) {
            fileList.push(fileInput.files[i]);
        }
    });
    
    function sendFile(file, status){
        var formData = new FormData();
        formData.append('file', file);
        $.ajax({
            url : '/interactive',
            type : 'POST',
            data : formData,
            processData: false,
            contentType: false,
            success : function(entry) {
                var divContan = $('<div />').addClass('container2')
                var left = $('<div />').addClass('left')
                var right = $('<div />').addClass('right')
                var img = $("<img />").attr('src', "data:image/png;base64, " + entry.data).attr('width', '100%')
                $('#response-list').append(divContan.append(left.append(img))
                                                    .append(right.append($("<p />").text(entry.originalName)))   
                                                    .append(right.append($("<p />").text(entry.prediction))))
                status.current++;
                if(status.current == status.total){
                    $('#for-spinner').empty()
                }
            }
        });
    };
});
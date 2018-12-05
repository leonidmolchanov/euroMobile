// Создаем пространство имен
var forTask = BX.namespace('forTask');
forTask.url = "/local/api.php";
// Функция поиска вставки кнопки
forTask.createButton = function() {
    forTask.kanbanTimer = setInterval(function() {
        var mainKanbanDiv = BX.findChildByClassName(document, 'task-view-buttonset', true);
        if (mainKanbanDiv) {
            clearInterval(forTask.kanbanTimer);
            var Button = BX.create('span', {
                attrs : {
                    title : BX.message('splitting_delegate'),
                    class : 'menu-popup-item menu-popup-item-delegate'
                },
                events : {
                    click : forTask.createTable
                },
                html : '<span class="webform-small-button webform-small-button-accept">'+BX.message("redistribute_button")+'</span>'
            });
            mainKanbanDiv.appendChild(Button);
        }
    }, 100);
};

////////////////////////////////
///////////////////////////////
//Table constructor
forTask.constructor.createTable={};
forTask.constructor.createTable.table = function (thead, tbody){
    //class="bx-layout-inner-inner-table"
    content = '<table cellpadding="0" cellspacing="0" border="0" class="task-table">';
    content += thead;
    content += tbody;
    content+='</table>'
    return content;
}
forTask.constructor.createTable.thead = function (arr){
 content = '<tr><th class="head-td">'+BX.message("workers")+'</th>';
    arr.forEach( function (item) {
 content += '<th class="head-td">'+item[0]+'</th>';
    });
    content+='</tr>'
    return content;
}
forTask.constructor.createTable.user = function (user, calendar, worktime, data){
    function classGen(day){
        day=Number(day)
        if (day == 0) {
            return "low-hours";
        }
        else if (day <= 3) {
            return "mid-hours";
        }
        else if (day > 3) {
            return "norm-hours";
        }
    }
    function checkDate(date, tasks){
        date = date.split('.')
        date = date[0]+'.'+date[1];
        count=0;
        function parseDate(element){
            element = element.split(' ');
            element= element[0];
            element = element.split('.');
            element = element[0]+'.'+element[1]
            return element

        }
        tasks.forEach(function (item) {
            if(item['START_DATE_PLAN']!==null && item['PARENT_ID']!==null && item['DURATION_PLAN']!=="0") {
                if (item['STATUS'] == 2 || item['STATUS'] == -2) {
                    if (parseDate(item['START_DATE_PLAN']) == date) {
                        count += Number(item['TIME_ESTIMATE'])
                    }
                }
            }
        });
        count = (count/3600).toFixed()
        return count;
    }
    tbody="";
        user.forEach(function (userData) {
            if(data.user['access']!==null && data.user['access']!=="0") {
            if (userData['PROPERTIES']['UF_TASK_STATUS'] == 1) {
                content = '<tr><td class="null-td"><a href="/company/personal/user/'+userData["ID"]+'/">' + userData["LAST_NAME"] + ' ' + userData["NAME"] + '</a></td>';
                calendar.forEach(function (item) {
                    if (item[1] !== true) {
                        if (userData["UF_TASK_WORK_TIME"] !== null) {
                            time = userData["UF_TASK_WORK_TIME"] - checkDate(item[0], userData.TASKS);
                            content += '<td onclick="selectElement(this)" ondblclick="forTask.showTasksDay(this,data)" data-user-id="' + userData["ID"] + '"  data-date="' + item[0] + '" class="' + classGen(time) + '">' + time + '</td>';
                        }
                        else {
                            time = worktime.endtime - worktime.starttime - checkDate(item[0], userData.TASKS);
                            content += '<td onclick="selectElement(this)" ondblclick="forTask.showTasksDay(this, data)" data-user-id="' + userData["ID"] + '" data-date="' + item[0] + '" class="' + classGen(time) + '">' + time + '</td>';
                        }
                    }
                    else {
                        content += '<td class="null-td"></td>';
                    }
                });
                content += '</tr>'
                tbody += content;
            }

        }
        else if(data.user['access']==null || data.user['access']=="0" && data.user['ID']==userData['ID'])
            {
                    if (userData['PROPERTIES']['UF_TASK_STATUS'] == 1) {
                        content = '<tr><td class="null-td"><a href="/company/personal/user/'+userData["ID"]+'/">' + userData["LAST_NAME"] + ' ' + userData["NAME"] + '</a></td>';
                        calendar.forEach(function (item) {
                            if (item[1] !== true) {
                                if (userData["UF_TASK_WORK_TIME"] !== null) {
                                    time = userData["UF_TASK_WORK_TIME"] - checkDate(item[0], userData.TASKS);
                                    content += '<td  ondblclick="forTask.showTasksDay(this,data)" data-user-id="' + userData["ID"] + '"  data-date="' + item[0] + '" class="' + classGen(userData["UF_TASK_WORK_TIME"]) + '">' + time + '</td>';
                                }
                                else {
                                    time = worktime.endtime - worktime.starttime - checkDate(item[0], userData.TASKS);
                                    content += '<td  ondblclick="forTask.showTasksDay(this, data)" data-user-id="' + userData["ID"] + '" data-date="' + item[0] + '" class="' + classGen(time) + '">' + time + '</td>';
                                }
                            }
                            else {
                                content += '<td class="null-td"></td>';
                            }
                        });
                        content += '</tr>'
                        tbody += content;
                    }
            }
            else{}
        })
    return tbody;
}
/////////////////////////////
//Personal class
forTask.constructor.createPersonal = function(person){
    this.name = person.name;
    this.lastName = person.lastName;
};
////////////////////////////
//Buttons constructor
forTask.constructor.createButton = function(type, className, value, functionName, url, params, data){
    content = '<button type="'+type+'" onClick="'+functionName+'(forTask.url, params, data)" class="'+className+'">'+value+'</button>';
    return content
};
//Функция выбора ячеек
function selectElement(element){
    if(element.className!=="nulltd") {
        if (element.className.match(/(?:^|\s)select(?!\S)/)) {
            element.className =element.className.replace(/(?:^|\s)select(?!\S)/g, '')
        }
        else {
            element.className += " select";
        }
    }
}
// Функция загрузи главного окна
forTask.createTable = function() {
    params = {
        sessid: BX.bitrix_sessid(),
        href : document.location.href
    }
    forTask.ajax.getStart = function (url, params) {
        BX.ajax.get(url,
            params,
            function (response) {
                data = JSON.parse(response)
                console.log(data)
                if (data.task['PARENT_ID'] == null && data.user['access']!=="0" && data.user['access']!==null) {
                    if(data.task['ALLOW_TIME_TRACKING']=="Y")
                    {
                        if(document.getElementById('createTasksForm')){
                            window.location.reload(false);
                        }
                        table = {};
                    table.content = '<div class="conteiner">' +
                        forTask.constructor.createTable.table(forTask.constructor.createTable.thead(data.calendarModify), forTask.constructor.createTable.user(data.user.group, data.calendar, data.worktime, data)) +
                        forTask.constructor.createButton("button", "webform-small-button webform-small-button-accept", BX.message('delegate'), "forTask.createTask", forTask.url, params, data) +
                        "<button onclick='forTask.settingUser(data.user.group, data.worktime)' class='webform-small-button webform-small-button-accept'><span class='webform-small-button-text'>" + BX.message('setting_button') + "</span></button>" +
                        "<button onclick='forTask.settingTask(data.subtask, data.task, data)' class='webform-small-button webform-small-button-accept'><span class='webform-small-button-text'>" + BX.message('change_button') + "</span></button>" +
                        '</div>';
                    forTask.createTable.popup = new BX.PopupWindow('main', null, {
                        lightShadow: false,
                        closeByEsc: true,
                        closeIcon: true,
                        overlay: {
                            opacity: 50,
                            backgroundColor: '#000'
                        },
                        titleBar: BX.message('task_list_workers'),
                        content: BX.create('div', {
                            html: table.content
                        })
                    });
                    forTask.createTable.popup.show();
                }
else{
                        content="<form>";
                        content += "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable'  width='100%'><tr><td class='head-td'>"+BX.message('timeForTask')+"</td></tr>" ;
                        content += '<tr><td class="null-td"><input type="number"  value="1" data-taskid="'+data.task["ID"]+'" min="1"   class="calendar-field calendar-field-datetime" size="2" maxlength="2">'+BX.message("hours")+'</td></tr>'
                        content +="</table>";
                        content += '<br><button type="button" onClick="forTask.setTaskTime(this.form)" class="webform-small-button webform-small-button-accept">'+BX.message('toDo')+'</button>';
                        content +="</form>";
                        forTask.createTable.popup = new BX.PopupWindow('main', null, {
                            lightShadow: false,
                            closeByEsc: true,
                            closeIcon: true,
                            overlay: {
                                opacity: 50,
                                backgroundColor: '#000'
                            },
                            titleBar: BX.message("createTableTitle"),
                            content: BX.create('div', {
                                html: content
                            })
                        });
                        forTask.createTable.popup.show();

                    }
            }
            });
    }
    forTask.ajax.getStart(forTask.url, params);
}
// Функция загрузи главного окна в режиме пользователя
forTask.createTableForce = function() {
    params = {
        sessid: BX.bitrix_sessid(),
    }
        BX.ajax.get(forTask.url,
            params,
            function (response) {
                 data = JSON.parse(response)
                     table = {};
                     table.content = '<div class="conteiner">' +
                         forTask.constructor.createTable.table(forTask.constructor.createTable.thead(data.calendarModify), forTask.constructor.createTable.user(data.user.group, data.calendar, data.worktime, data)) +
                '</div>';
                    forTask.createTable.popup = new BX.PopupWindow('main', null, {
                        lightShadow: false,
                        closeByEsc: true,
                        closeIcon: true,
                        overlay: {
                            opacity: 50,
                            backgroundColor: '#000'
                        },
                        titleBar: BX.message('task_list_worker'),
                        content: BX.create('div', {
                            html: table.content
                        })
                    });
                    forTask.createTable.popup.show();
            });
    }
////////////////////////////////
//Функции ajax
////////////////////////////
// Ajax constructor
 forTask.ajax={};
forTask.ajax.getStart = function (url, params) {
    BX.ajax.get(url,
        params,
        function (response) {
        data = JSON.parse(response)
        });
}
forTask.settingUser = function(user, workDay){
    content="<form>";
content += "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable'  width='100%'><tr><td class='head-td'>"+BX.message('worker')+"</td><td class='head-td'>"+BX.message('add_in_report')+"</td><td class='head-td'>"+BX.message('norm_in_day')+"</td></tr>" ;
    user.forEach(function (item) {
        worktimePlaceholder="";
        worktimeValue="";
        if(item["PROPERTIES"]["UF_TASK_WORK_TIME"]==null){
            worktimePlaceholder = workDay.endtime - workDay.starttime
        }
        else{
            worktimeValue = item["PROPERTIES"]["UF_TASK_WORK_TIME"];
        }
        if(item["PROPERTIES"]["UF_TASK_STATUS"]==1)
        {
            checked = "checked";
        }
        else{
            checked="";
        }
content+='<tr class="settingUserRow"><td class="null-td"><a href="/company/personal/user/'+item["ID"]+'/">'+item["LAST_NAME"]+' '+item["NAME"]+'</a></td><td class="null-td"><input type="checkbox" data-userid="'+item["ID"]+'" '+checked+' /></td><td class="null-td"><input type="number"  placeholder="'+worktimePlaceholder+'" data-userid="'+item["ID"]+'" min="0" max="24" value="'+worktimeValue+'" class="calendar-field calendar-field-datetime" size="2" maxlength="2"></td>'
    })
    content+="</table>";
    content += '<button type="button" onClick="forTask.saveSettingUser(this.form)" class="webform-small-button webform-small-button-accept">'+BX.message("save")+'</button>';
    content +="</form>";
    forTask.createSettingUserPopup = new BX.PopupWindow('settingUserPopup', null, {
        lightShadow: true,
        closeByEsc: true,
        closeIcon: true,
        overlay: {
            opacity: 50,
            backgroundColor: '#000'
        },
        titleBar: BX.message("users_remark"),
        content: BX.create('div',
            {
                attrs: {
                    backgroundColor: '#000'
                },
                html: content

            })
    });
    forTask.createSettingUserPopup.show();
}
forTask.settingTask = function(subtask, task, data){
    function parseDateformat(date) {
        content = date.split(' ');
        content = content[0].split('.');
        content = content['2']+'-'+content['1']+'-'+content['0'];
        return content ;

    }
    function parseTimeformat(date) {
        content = date.split(' ');
        content = content[1].split(':');
        content = content['0']+':'+content['1'];
        return content ;

    }
    content = "<form>";
    content += "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable'  width='100%'><tr><td class='head-td'>"+BX.message('timeForTask')+":</td><td class='null-td' colspan='3'>"+(task['TIME_ESTIMATE']/3600).toFixed()+" "+BX.message('hour')+"</td></tr>";
    content += "<tr><td class='head-td'>"+BX.message('subtask_name')+"</td><td class='head-td'>"+BX.message('subtask_time')+"</td><td class='head-td'>"+BX.message('data')+"</td><td class='head-td'>"+BX.message('time_to_start')+"</td></tr>" ;
    subtask.forEach(function (item) {
        if(item['STATUS']==2 || item['STATUS']==-2) {
        status="true"
        }
        else{
            status="false"
        }
            content += "<tr class='subtaskList'><td class='null-td'>" + item['TITLE'] + "</td><td class='null-td'><input type='number'  data-id='" + item['ID'] + "' min='0' max='24'  value='" +(item['TIME_ESTIMATE']/3600).toFixed() + "' class='calendar-field calendar-field-datetime' size='2' maxlength='2'></td><td class='null-td'><input type='date' data-id='" + item['ID'] + "' value='" + parseDateformat(item['START_DATE_PLAN']) + "' class='calendar-field calendar-field-datetime'></td><td class='null-td'><input type='time' step='3600' data-id='" + item['ID'] + "' value='" + parseTimeformat(item['START_DATE_PLAN']) + "' class='calendar-field calendar-field-datetime'></td></tr>";
        });
    content+="</table>";
    content += '<button  type="button" onclick="forTask.changeTaskSetting(this.form, data)"  class="webform-small-button webform-small-button-accept">'+BX.message('change_button')+'</button>';
    content += "</form>";
    forTask.createSettingTaskPopup = new BX.PopupWindow('settingTaskPopup', null, {
        lightShadow: true,
        closeByEsc: true,
        closeIcon: true,
        overlay: {
            opacity: 50,
            backgroundColor: '#000'
        },
        titleBar: BX.message("task_remark"),
        content: BX.create('div',
            {
                attrs: {
                    backgroundColor: '#000'
                },
                html: content

            })
    });
    forTask.createSettingTaskPopup.show();
}
//Окно детального просмотра задач по дню
forTask.showTasksDay = function(date, data){
    function getSubtask(taskId, data){
        contentProgress=[];
        for(key in data.user.group){
            for(task in data.user.group[key].TASKS) {
                if(data.user.group[key].TASKS[task]['PARENT_ID']==taskId) {
                    contentProgress.push(data.user.group[key].TASKS[task]['COMPLETE_STATUS']);
                }
            }
        }
   return contentProgress;
    }
    function getParentTask(id, tasks){
        response="";
        tasks.forEach( function (task) {
            if(id==task['ID']){
                response =  task['TITLE'];
            }
        })
        return response;
    }
    function getParentGroup(id, tasks, group){
        response="";
        if(group) {
            group.forEach(function (arGroup) {
                if (id == arGroup['ID']) {
                    response = arGroup['NAME'];
                }
            })
        }
        return response;
    }
    content = "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable'  width='100%'><tr><td class='Headtd'>"+BX.message('time')+"</td><td class='Headtd'>"+BX.message('project')+"</td><td class='Headtd'>"+BX.message('parent_task')+"</td><td class='Headtd'>"+BX.message('task')+"</td><td class='Headtd'>"+BX.message('task_avtor')+"</td><td class='Headtd'>"+BX.message('deadline')+"</td><td class='Headtd'>"+BX.message('remark')+"</td></tr>";
    data.user.group.forEach(function (item){
        if(item['ID']==date.attributes['data-user-id'].value) {
            item.TASKS.forEach(function (task) {
                if (task['PARENT_ID'] !== null && task['START_DATE_PLAN'].includes(date.attributes['data-date'].value)) {
            if(task['STATUS']==2 || task['STATUS']==-2){
                    contentProgress = getSubtask(task["PARENT_ID"], data);
                    progerssHTML = 0;
                    contentProgress.forEach(function (item) {
                        progerssHTML += item;
                    });
                progerssHTML=(progerssHTML/contentProgress.length).toFixed(2)+"%";
                if(!data.group)
                {
                    data.group = false
                }
                console.log(task)
                    if (data.user['access'] == null || data.user['access'] == "0") {
                        content += '<tr><td class="null-td">' + (task["TIME_ESTIMATE"]/3600).toFixed() + '</td><td class="null-td">'+getParentGroup(task["PARENT_ID"], item.TASKS, data.group)+'</td><td class="null-td">'+getParentTask(task["PARENT_ID"], item.TASKS)+'</td><td class="null-td"><a href="#" data-task-id="' + task["PARENT_ID"] + '" onclick="forTask.showDetailTask(this)">' + task["TITLE"] + '</a></td><td class="null-td"><a href="/company/personal/user/'+task["CREATED_BY"]+'/">' + task["CREATED_BY_NAME"] + ' ' + task["CREATED_BY_LAST_NAME"] + '</a></td><td class="null-td">'+task["END_DATE_PLAN"]+'</td><td class="null-td"><a href="#" data-task-id="' + task["PARENT_ID"] + '" onclick="forTask.returnTask(this)">'+BX.message('return_task')+'</a></td></tr>'

                    }
                    else {
                        content += '<tr><td class="null-td">' + (task["TIME_ESTIMATE"]/3600).toFixed() + '</td><td class="null-td">'+getParentGroup(task["PARENT_ID"], item.TASKS, data.group)+'</td><td class="null-td">'+getParentTask(task["PARENT_ID"], item.TASKS)+'</td><td class="null-td"><a href="#" data-task-id="' + task["PARENT_ID"] + '" onclick="forTask.showDetailTask(this)"> ' + task["TITLE"] + '</a></td><td class="null-td"><a href="/company/personal/user/'+task["CREATED_BY"]+'/">' + task["CREATED_BY_NAME"] + ' ' + task["CREATED_BY_LAST_NAME"] + '</a></td><td class="null-td">'+task["END_DATE_PLAN"]+'</td><td class="null-td"><a href="#" data-task-id="' + task["PARENT_ID"] + '" onclick="forTask.returnTask(this)">'+BX.message('return_task')+'</a> </td></tr>'
                    }
                }
            }
            });
        }
    });
    content+="</table>";
    forTask.createShowTasksDayPopup = new BX.PopupWindow('ShowTasksDay', null, {
        lightShadow: true,
        closeByEsc: true,
        closeIcon: true,
        overlay: {
            opacity: 50,
            backgroundColor: '#000'
        },
        titleBar: BX.message("task_list_worker"),
        content: BX.create('div',
            {
                attrs: {
                    backgroundColor: '#000'
                },
                html: content

            })
    });
    forTask.createShowTasksDayPopup.show();
}
// Окно настроек создания задачи
forTask.createTask = function(url, params, data) {
    selectCalendar = document.getElementsByClassName('select');
        content = "<form  id='createTasksForm'>";
        content += "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable' id='submitTable' width='100%'><tr><td colspan='2' class='head-td'>"+BX.message('sum_task_time')+":</td><td class='head-td'><input   type='number'  class='changeTaskTime' min='0'  placeholder='"+(data.task['TIME_ESTIMATE']/3600).toFixed()+"' class='calendar-field calendar-field-datetime' size='2' maxlength='2'></td></tr>" ;
        content +="<tr><td class='head-td' colspan='2'>Дата:</td><td class='Headtd'>Время:</td></tr>";
    timeForTask =(data.task['TIME_ESTIMATE']/3600).toFixed()
    function parseDateformat(date) {
       content = date.split('.');
        content = content['2']+'-'+content['1']+'-'+content['0'];
        return content ;
    }
// Функция проверки и сдвига стартового времени
    function changeTaskStartTime(id, dayTime, date) {
        // Функция переформатирования времени
        function timeFormat(daytime) {
            response = daytime;
            response = response.split(' ');
            response = response[1].split(':');
            response=Number(response[0]);
            return response;

        }
        result  = timerFormat(dayTime.starttime);
       // Функция переформатирования даты
        function dateFormat(dayDate) {
            response = dayDate;
            response = response.split(' ');
            response = response[0];
            return response;

        }
        function timerFormat(t){
            response="";
if (t<10){
    response = "0"+t+":00";
}
else{
    response = t+":00";
}
return response;
        }
        data.user.group.forEach( function (item) {
            if(item['ID']==id){
                      item['TASKS'].forEach(function (task) {
                     if(task['START_DATE_PLAN']!==null) {
                        if (task['STATUS'] == 2 || task['STATUS'] == -2) {
                            if(date == dateFormat(task['START_DATE_PLAN'])) {
                                for (var i = dayTime.starttime; i < dayTime.endtime+1 ; i++) {
                                    if(i == timeFormat(task['START_DATE_PLAN'])){
                                        result = timerFormat(timeFormat(task['END_DATE_PLAN']))
                                        break
                                    }
                                }
                            }
                        }
                     }
                 })
             }
        })
        return result;
    }
        for (var i = 0; i < selectCalendar.length; i++) {
        time = Number(selectCalendar[i].innerText);
        timeToTable = 0;
        if(timeForTask - time >=0)
        {
            timeForTask -=time;
            TimeToTable = time;
        }
        else{
            TimeToTable = timeForTask;
            timeForTask = 0;
            }
        content += "<tr class='submitElement'><td class='null-td'><input type='date' data-user-id='"+selectCalendar[i].attributes['data-user-id'].value+"' value='"+parseDateformat(selectCalendar[i].dataset.date)+"' class='calendar-field calendar-field-datetime' disabled></td><td class='null-td'><input data-user-id='"+selectCalendar[i].attributes['data-user-id'].value+"' class='calendar-field calendar-field-datetime' type='time' value='"+changeTaskStartTime(selectCalendar[i].attributes['data-user-id'].value, data.worktime, selectCalendar[i].dataset.date)+"' step='3600'></td><td class='null-td'><input   type='number'  data-user-id='"+selectCalendar[i].attributes['data-user-id'].value+"' min='0' max='"+time+"' value='"+TimeToTable+"' class='calendar-field calendar-field-datetime' size='2' maxlength='2'></td></tr>"
    }
    content+="</table>";
    content += '<button type="button" onClick="forTask.submitCreateTask(this.form, data)" class="webform-small-button webform-small-button-accept">'+BX.message('splitting_create')+'</button>';
    content += "</form>";
    forTask.createTaskPopup = new BX.PopupWindow('changeTask', null, {
            lightShadow: true,
            closeByEsc: true,
            closeIcon: true,
            overlay: {
                opacity: 50,
                backgroundColor: '#000'
            },
            titleBar: BX.message("task_create"),
            content: BX.create('div',
                {
                    attrs: {
                        backgroundColor: '#000'
                    },
                    html: content

                })
        });
    forTask.createTaskPopup.show();

};
// Создание задачи
forTask.submitCreateTask = function(form, data) {
    taskTime = form.getElementsByClassName('changeTaskTime')

    function parseForm(form) {
        content = form.getElementsByClassName('submitElement');
        result = [];
        for (var i = 0; i < content.length; i++) {
            td = content[i].getElementsByTagName('td');
            row = []
            for (var y = 0; y < td.length; y++) {
                element = td[y].getElementsByTagName('input')
                row.push(element[0].value);
            }
            result.push(row);
        }

        return result;
    }

    function checkUser(form) {
        content = form.getElementsByClassName('submitElement');
        result = [];
        row = []
        for (var i = 0; i < content.length; i++) {
            td = content[i].getElementsByTagName('td');
            for (var y = 0; y < td.length; y++) {
                element = td[y].getElementsByTagName('input')
                row.push(element[0].attributes['data-user-id'].value);
            }
        }
        result = "";
        fErr= false
        row.forEach(function (item) {
            if (row[0] !== item) {
                fErr = true;
            }
            result = item;
        });
        if(fErr==true){
            return "error";
        }
        else {
            return result;
        }
    }
    function checkTime(data, time) {
        content = 0;
        data.forEach(function (item) {
            content += item[2] * 3600;
        });
        if ((content / 3600).toFixed() == (time / 3600).toFixed()) {
            return "success";
        }
        else {
            return "error";
        }
    }
    // Функция переформатирования времени
    function DateFormat(date) {
        content = date;
        content = content.split('-');
        content = content['2'] + '.' + content['1'] + '.' + content['0'];
        return content;

    }
    // Функция проверки совпадения времени
    function checkTaskTimeResult(form) {
    function checkTaskTime(formTime, taskTime) {
        content = "success";
        task = taskTime;
        taskTimeLong = Number(formTime[2]) * 100;
        formTime = formTime[1];
        formTime = formTime.split(":");
        formTime = formTime[0] + formTime[1];
        taskTimeStart = taskTime['START_DATE_PLAN'].split(" ")[1];
        taskTimeStart = taskTimeStart.split(":");
        taskTimeStart = taskTimeStart[0] + taskTimeStart[1];
        taskTimeEnd = taskTime['END_DATE_PLAN'].split(" ")[1];
        taskTimeEnd = taskTimeEnd.split(":");
        taskTimeEnd = taskTimeEnd[0] + taskTimeEnd[1];
        if (Number(taskTimeStart) <= Number(formTime) && Number(formTime) <= Number(taskTimeEnd)) {
            content = "error";
        }
        else if (Number(taskTimeStart) <= Number(formTime) + taskTimeLong && Number(formTime) + taskTimeLong <= Number(taskTimeEnd)) {
            content = "error";
        }
        return content;
    }
        response="";
        parse = parseForm(form)
        parse.forEach(function (parseFor) {
            data.user.group.forEach( function (item) {
                if(item['ID']==checkUser(form)){
                    item['TASKS'].forEach(function (task) {
                        if(task['START_DATE_PLAN']!==null) {
                            if (task['STATUS'] == 2 || task['STATUS'] == -2) {
                                if (DateFormat(parseFor[0]) === task['START_DATE_PLAN'].split(" ")[0]) {
                                    response = checkTaskTime(parseFor, task);
                                }
                            }
                        }
                    })

                }
            })
        })
return response;
}
    // Функция проверки нуливых дней
    function checkZeroTask(form) {
        result = "success";
        form.forEach(function (item) {
if(item[2]==0){
    result = "error";
}
        })
        return result;
    }
    if(data.subtask.length==0) {
        taskCheckTime = data.task['TIME_ESTIMATE'];
        if(taskTime[0].value!=="") {
            taskCheckTime =taskTime[0].value * 3600
        }
        if (checkTime(parseForm(form), taskCheckTime) == "success") {
        if(checkUser(form)=="error"){
                alert(BX.message("task_add_err_users"));
            }
            else {
            if(checkZeroTask(parseForm(form))=="success") {
                // if(checkTaskTimeResult(form) =="success"){

                    request = [];
                    request.data = data;
                    request.form = parseForm(form);
                    params = {
                        sessid: BX.bitrix_sessid(),
                        href: document.location.href,
                        type: "addTasks",
                        data: parseForm(form),
                        userid: checkUser(form)
                    }
                    BX.ajax.get(forTask.url,
                        params,
                        function (response) {
                            if(response=="success"){
                                alert(BX.message('task_delegate_proc'));
                                window.location.reload(false);
                            }
                        });
            }
            else{
                alert(BX.message('task_add_err_zero'));
            }
            }
        }
        else {
            alert(BX.message('task_add_err_time'));
        }
    }
    else {
        alert(BX.message('task_add_err_dbl'));
    }


}
// Сохранение настроект пользователей
forTask.saveSettingUser = function (data) {
    function parseData(data){
        content=data.getElementsByTagName('input');
        result={};
        for (var i = 0; i < content.length; i++) {
            if(!result[content[i].attributes['data-userid'].value]){
                result[content[i].attributes['data-userid'].value]={};
            }
            if(content[i].type=="checkbox") {
                result[content[i].attributes['data-userid'].value].checked = content[i].checked

            }
            else if(content[i].type=="number") {
                result[content[i].attributes['data-userid'].value].time = content[i].value;
            }
        }
        return result;
    }
    params = {
        sessid: BX.bitrix_sessid(),
        href: document.location.href,
        type: "changeUserSetting",
        data: parseData(data)
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {
            if(response=="success"){
                alert(BX.message('setting_save'));
                window.location.reload(false);
            }
        });


}
//Функция установки общего времени на задачу
forTask.setTaskTime = function(form){
    content=form.getElementsByTagName('input');
    data={};
    data.taskid = content[0].attributes['data-taskid'].value;
    data.value = content[0].value;

    params = {
        sessid: BX.bitrix_sessid(),
        href: document.location.href,
        type: "setTaskTime",
        data: data
    }
    if(data.value>0) {
        BX.ajax.get(forTask.url,
            params,
            function (response) {
                if (response == "success") {
                    alert(BX.message('setting_task_change'));
                    window.location.reload(false);
                }
            });
    }
    else{
        alert(BX.message('create_task_err'))
    }

}
// Функция изменения настроек задачи
forTask.changeTaskSetting = function (form, data) {
    function parseData(data){
        content=form.getElementsByTagName('input');
        result={};
        for (var i = 0; i < content.length; i++) {
            if(!result[content[i].attributes['data-id'].value]){
                result[content[i].attributes['data-id'].value]={};
            }
            if(content[i].type=="date") {
                result[content[i].attributes['data-id'].value].date = content[i].value;

            }
            else if(content[i].type=="number") {
                result[content[i].attributes['data-id'].value].time = content[i].value;
            }
            else if(content[i].type=="time") {
                result[content[i].attributes['data-id'].value].startTime = content[i].value;
            }
        }
        return result;
    }
    function checkTime(taskArr, taskTime){
        time=0;
        for (key in taskArr) {
        time+=Number(taskArr[key].time)
        }
        realTime = Number((taskTime/3600).toFixed());
        if(time!==realTime){
            return "error";
        }
        else{
            return "success";
        }
        }
    if(checkTime(parseData(form), data.task['TIME_ESTIMATE'])=="success")
    {
        params = {
            sessid: BX.bitrix_sessid(),
            href: document.location.href,
            type: "changeTasks",
            data: parseData(form)
        }
        BX.ajax.get(forTask.url,
            params,
            function (response) {
                if(response=="success"){
                    alert(BX.message('setting_subtask_change'));
                    window.location.reload(false);
                }
            });

    }
    else{
        alert(BX.message('error_proc_time'))
    }
}
// Снятие задачи
forTask.closeTask = function (data) {
    params = {
        sessid: BX.bitrix_sessid(),
        href: document.location.href,
        type: "closeTasks",
        taskid: data.task['ID']
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {

            if(response=="success"){
                alert(BX.message('task_close'));
                window.location.reload(false);
            }
        });
}

// просмотр более детальной задачи
forTask.showDetailTask = function(data){
    params = {
        sessid: BX.bitrix_sessid(),
        //href: document.location.href,
        type: "showDetailTask",
        data: data.attributes['data-task-id'].value
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {
        data = JSON.parse(response)
            content = "<table cellpadding='0' cellspacing='0' border='0' class='Tasktable' width='100%'><tr><td  class='head-td'>"+BX.message('task_name')+":</td><td class='head-td'>"+BX.message('start')+":</td><td class='head-td'>"+BX.message('end')+":</td><td class='head-td'>"+BX.message('progress')+":</td></tr>" ;
        data.forEach(function (item) {
            content+="<tr><td class='null-td'>"+item['TITLE']+"</td><td class='null-td'>"+item['START_DATE_PLAN']+"</td><td class='null-td'>"+item['END_DATE_PLAN']+"</td><td class='null-td'>"+item['COMPLETE_STATUS']+"%</td></tr>"
        })
        content += "</table>";
            forTask.createShowDetailTaskPopup = new BX.PopupWindow('ShowDetailTask', null, {
                lightShadow: true,
                closeByEsc: true,
                closeIcon: true,
                overlay: {
                    opacity: 50,
                    backgroundColor: '#000'
                },
                titleBar: BX.message("task_window"),
                content: BX.create('div',
                    {
                        attrs: {
                            backgroundColor: '#000'
                        },
                        html: content

                    })
            });
            forTask.createShowDetailTaskPopup.show();
            }
        );
}
// Восстановление задач
forTask.openTasks = function(data){
    params = {
        sessid: BX.bitrix_sessid(),
        href: document.location.href,
        type: "openTasks",
        taskid: data.task['ID']
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {

            if(response=="success"){
                alert(BX.message('task_unclose'));
                window.location.reload(false);
            }
        });
}
// Снятие задачи из графика
forTask.closeTask2 = function (data) {
    params = {
        sessid: BX.bitrix_sessid(),
        type: "closeTasks",
        taskid: data.attributes['data-task-id'].value
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {
            if(response=="success"){
                alert(BX.message('task_close'));
                window.location.reload(false);
            }
        });
}
// Вернуть задачу постановщику
forTask.returnTask = function (data) {
    params = {
        sessid: BX.bitrix_sessid(),
        type: "returnTask",
        taskid: data.attributes['data-task-id'].value
    }
    BX.ajax.get(forTask.url,
        params,
        function (response) {
            if(response=="success"){
                alert(BX.message('task_return'));
                window.location.reload(false);
            }
        });
}
localStorage.removeItem("currentLevel")
localStorage.removeItem("isCharge")
localStorage.removeItem("chargingTime")
localStorage.removeItem("dischargingTime")
localStorage.removeItem("charge_level")
localStorage.removeItem("charge_basetime")
localStorage.removeItem("level_basetime")
localStorage.removeItem("confirm_margin")
localStorage.removeItem("alert_margin")
localStorage.removeItem("id")

function convert_to_normaltime(unixtime) {
    let date = new Date(unixtime * 1000);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hour = String(date.getHours()).padStart(2, '0');
    let minute = String(date.getMinutes()).padStart(2, '0');
    let second = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

function convert_to_hms(time) {
    let hour = Math.floor(time / 3600);
    let min = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    let second = String(time % 60).padStart(2, '0');
    return `${hour}:${min}:${second}`;
};

function getUnixtime() {
    return Math.floor(new Date().getTime() / 1000);
};

function getUnixtime_c() {
    return Math.floor(new Date().getTime());
}

function copyText(elementId) {
    navigator.clipboard.writeText(document.getElementById(elementId).value);
}

document.getElementById('copy').addEventListener('click', function () {
    copyText('history');
})

document.getElementById('alert-header').onpointermove = function (event) {
    if (event.buttons) {
        document.getElementById('alert-content').style.left = document.getElementById('alert-content').offsetLeft + event.movementX + 'px'
        document.getElementById('alert-content').style.top = document.getElementById('alert-content').offsetTop + event.movementY + 'px'
        document.getElementById('alert-content').draggable = false
        document.getElementById('alert-header').setPointerCapture(event.pointerId)
    }
}

document.getElementById('confirm-header').onpointermove = function (event) {
    if (event.buttons) {
        document.getElementById('confirm-content').style.left = document.getElementById('confirm-content').offsetLeft + event.movementX + 'px'
        document.getElementById('confirm-content').style.top = document.getElementById('confirm-content').offsetTop + event.movementY + 'px'
        document.getElementById('confirm-content').draggable = false
        document.getElementById('confirm-header').setPointerCapture(event.pointerId)
    }
}

let alert_margin;
function alertOpen(alertText) {
    document.getElementById('alert').style.display = 'block';
    document.getElementById('alert-text').textContent = alertText;

    alert_margin = document.getElementById('alert-content').style.margin;
    let x = document.getElementById('alert-content').offsetLeft;
    let y = document.getElementById('alert-content').offsetTop;
    document.getElementById('alert-content').style.left = x + 'px';
    document.getElementById('alert-content').style.top = y + 'px';
    document.getElementById('alert-content').style.position = 'absolute';
    document.getElementById('alert-content').style.margin = '0px';
};

function alertClose() {
    document.getElementById('alert').style.display = 'none';

    document.getElementById('alert-content').style.position = 'static';
    document.getElementById('alert-content').style.margin = alert_margin;
};

document.getElementById('alert-close-cross').addEventListener('click', alertClose);
document.getElementById('alert-close-ok').addEventListener('click', alertClose);

let id;
let confirm_margin;
function confirmOpen(confirmText, identification) {
    document.getElementById('confirm').style.display = 'block';
    document.getElementById('confirm-text').textContent = confirmText;
    id = identification;

    confirm_margin = document.getElementById('confirm-content').style.margin;
    let x = document.getElementById('confirm-content').offsetLeft;
    let y = document.getElementById('confirm-content').offsetTop;
    document.getElementById('confirm-content').style.left = x + 'px';
    document.getElementById('confirm-content').style.top = y + 'px';
    document.getElementById('confirm-content').style.position = 'absolute';
    document.getElementById('confirm-content').style.margin = '0px';
};

function confirmClose() {
    document.getElementById('confirm').style.display = 'none';

    document.getElementById('confirm-content').style.position = 'static';
    document.getElementById('confirm-content').style.margin = confirm_margin;
};

document.getElementById('confirm-close-cross').addEventListener('click', confirmClose)

document.getElementById('confirm-close-no').addEventListener('click', confirmClose)

document.getElementById('confirm-close-yes').addEventListener('click', function () {
    confirmClose();
    switch (id) {
        case 'delete': {
            localStorage.chargeChangeTime = JSON.stringify(null);
            localStorage.chargeLevel = JSON.stringify(null);
            break;
        }
        case 'stop': {
            localStorage.end = JSON.stringify([true, getUnixtime_c(), getCurrentlevel()]);
            let start = JSON.parse(localStorage.start);
            let end = JSON.parse(localStorage.end);
            let time = Math.floor((end[1] - start[1]) / 1000);
            let level;
            if (getCurrentlevel() == -1) {
                level = '--';
                addHistory(`[${convert_to_normaltime(getUnixtime())}] time: ${convert_to_hms(time)}`);
            } else {
                level = Math.abs(end[2] - start[2]);
                let type_log;
                if (isCharge() === true) {
                    type_log = 'charge efficiency';
                } else {
                    type_log = 'discharge efficiency';
                }
                let result_log;
                if (time > 60) {
                    result_log = `${(Math.round(level / (time / 60) * 100) / 100).toFixed(2)}%/min`;
                } else {
                    result_log = 'failed';
                }
                addHistory(`[${convert_to_normaltime(getUnixtime())}] type: ${type_log} | time: ${convert_to_hms(time)} | level: ${level}% | result: ${result_log}`);
            }
            break;
        }
        case 'reset': {
            localStorage.start = JSON.stringify([false, 0, 0]);
            localStorage.end = JSON.stringify([false, 0, 0]);
            break;
        }
        case 'clear': {
            document.getElementById('history').value = '';
            localStorage.log = '';
            break;
        }
    }
});

function addHistory(log) {
    if (log !== undefined) {
        if (document.getElementById('history').value != '') {
            document.getElementById('history').value += '\n';
            localStorage.log += '\n';
        }
        document.getElementById('history').value += log;
        localStorage.log += log;
    }
};

let currentLevel, charging, chargingTime, dischargingTime;

function refresh(name) {
    currentLevel = Math.round(name.level * 100);
    charging = name.charging;
    chargingTime = name.chargingTime;
    dischargingTime = name.dischargingTime;
}

if (navigator.getBattery) {
    navigator.getBattery().then(function (battery) {
        refresh(battery);
        console.log(battery);
    });
} else {
    console.log('Unavailable because it\'s not supported.');
}

function getCurrentlevel() {
    if (currentLevel !== undefined) {
        return Number(currentLevel);
    } else {
        return -1;
    }
};

function isCharge() {
    if (charging !== undefined) {
        return Boolean(charging);
    } else {
        return null;
    }
};

function getChargingTime() {
    if (chargingTime !== undefined) {
        return Number(chargingTime);
    } else {
        return -1;
    }
};

function getDischargingTime() {
    if (dischargingTime !== undefined) {
        return Number(dischargingTime);
    } else {
        return -1;
    }
};

function batteryDisplay_1() {
    if (isCharge() === null) {
        document.getElementById('unknown').style.display = 'inline';
        document.getElementById('discharge').style.display = 'none';
        document.getElementById('charge').style.display = 'none';
        document.getElementById('charge-false').style.display = 'none';
        document.getElementById('charge-true').style.display = 'none';
        document.getElementById('increase').style.display = 'none';
        document.getElementById('decrease').style.display = 'none';
        document.getElementById('full').style.display = 'none';
    } else {
        document.getElementById('unknown').style.display = 'none';
        if (isCharge()) {
            document.getElementById('discharge').style.display = 'none';
            document.getElementById('charge').style.display = 'inline';
            document.getElementById('charge-false').style.display = 'none';
            document.getElementById('charge-true').style.display = 'inline';
            if (getCurrentlevel() == 100) {
                document.getElementById('increase').style.display = 'none';
                document.getElementById('decrease').style.display = 'none';
                document.getElementById('full').style.display = 'inline';
            } else {
                document.getElementById('decrease').style.display = 'none';
                document.getElementById('full').style.display = 'none';
                document.getElementById('increase').style.display = 'inline';
            }
        } else {
            document.getElementById('charge').style.display = 'none';
            document.getElementById('discharge').style.display = 'inline';
            document.getElementById('charge-true').style.display = 'none';
            document.getElementById('charge-false').style.display = 'inline';
            if (getCurrentlevel() == 100) {
                document.getElementById('increase').style.display = 'none';
                document.getElementById('decrease').style.display = 'none';
                document.getElementById('full').style.display = 'inline';
            } else {
                document.getElementById('increase').style.display = 'none';
                document.getElementById('full').style.display = 'none';
                document.getElementById('decrease').style.display = 'inline';
            }
        }
    }
    if (getCurrentlevel() == -1) {
        document.getElementById('level').textContent = '--';
        switch (localStorage.theme) {
            case 'system': {
                if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.getElementById('level-area').style.color = '#000000';
                } else {
                    document.getElementById('level-area').style.color = '#ffffff';
                }
                break;
            }
            case 'light': {
                document.getElementById('level-area').style.color = '#000000';
                break;
            }
            case 'dark': {
                document.getElementById('level-area').style.color = '#ffffff';
                break;
            }
        }
    } else {
        document.getElementById('level').textContent = getCurrentlevel();
        if (getCurrentlevel() < 30) {
            document.getElementById('level-area').style.color = '#ee240a';
        } else if (getCurrentlevel() < 70) {
            switch (localStorage.theme) {
                case 'system': {
                    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                        document.getElementById('level-area').style.color = '#000000';
                    } else {
                        document.getElementById('level-area').style.color = '#ffffff';
                    }
                    break;
                }
                case 'light': {
                    document.getElementById('level-area').style.color = '#000000';
                    break;
                }
                case 'dark': {
                    document.getElementById('level-area').style.color = '#ffffff';
                    break;
                }
            }
        } else {
            document.getElementById('level-area').style.color = '#25cc1a';
        }
    }
    if (getChargingTime() == -1) {
        document.getElementById('charge-time').textContent = '-:--:--';
        document.getElementById('charge-infinity').style.display = 'none';
    } else {
        if (isFinite(getChargingTime())) {
            document.getElementById('charge-time').textContent = convert_to_hms(getChargingTime());
            document.getElementById('charge-infinity').style.display = 'none';
        } else {
            document.getElementById('charge-time').textContent = '-:--:--';
            document.getElementById('charge-infinity').style.display = 'inline';
        }
    }
    if (getDischargingTime() == -1) {
        document.getElementById('discharge-time').textContent = '-:--:--';
        document.getElementById('discharge-infinity').style.display = 'none';
    } else {
        if (isFinite(getDischargingTime())) {
            document.getElementById('discharge-time').textContent = convert_to_hms(getDischargingTime());
            document.getElementById('discharge-infinity').style.display = 'none';
        } else {
            document.getElementById('discharge-time').textContent = '-:--:--';
            document.getElementById('discharge-infinity').style.display = 'inline';
        }
    }
};

function batteryDisplay_2() {
    let charge_bt = localStorage.chargeChangeTime;
    let level_bt = localStorage.levelChangeTime;
    let start_level = localStorage.chargeLevel;
    if (localStorage.chargeChangeTime !== undefined && JSON.parse(localStorage.chargeChangeTime) !== null && (getUnixtime_c() - charge_bt) / 1000 < 18000) {
        document.getElementById('lastcharge-time').textContent = convert_to_normaltime(charge_bt / 1000);
        document.getElementById('lastcharge-elapse').textContent = convert_to_hms(Math.floor((getUnixtime_c() - charge_bt) / 1000));
    } else {
        document.getElementById('lastcharge-time').textContent = '----/--/-- --:--:--';
        document.getElementById('lastcharge-elapse').textContent = '-:--:--';
    }
    if (localStorage.chargeLevel !== undefined && JSON.parse(localStorage.chargeLevel) !== null) {
        document.getElementById('start-level').textContent = start_level;
    } else {
        document.getElementById('start-level').textContent = '--';
    }
    if (getCurrentlevel() == -1) {
        document.getElementById('current-level').textContent = '--';
    } else {
        document.getElementById('current-level').textContent = getCurrentlevel();
    }
    if (isCharge()) {
        if (localStorage.chargeLevel !== undefined && JSON.parse(localStorage.chargeLevel) !== null && start_level <= getCurrentlevel()) {
            document.getElementById('change-amount').textContent = getCurrentlevel() - start_level;
        } else {
            document.getElementById('change-amount').textContent = '--';
        }
        document.getElementById('discharge-amount').textContent = '--';
    } else {
        document.getElementById('change-amount').textContent = '--';
        if (localStorage.chargeLevel !== undefined && JSON.parse(localStorage.chargeLevel) !== null && getCurrentlevel() <= start_level) {
            document.getElementById('discharge-amount').textContent = start_level - getCurrentlevel();
        } else {
            document.getElementById('discharge-amount').textContent = '--';
        }
    }
    if (localStorage.levelChangeTime !== undefined) {
        if (getCurrentlevel() == start_level && isCharge() == false) {
            if ((getUnixtime_c() - charge_bt) / 1000 < 18000) {
                document.getElementById('lastlevel-time').textContent = convert_to_normaltime(charge_bt / 1000);
                document.getElementById('lastlevel-elapse').textContent = convert_to_hms(Math.floor((getUnixtime_c() - charge_bt) / 1000));
            } else {
                document.getElementById('lastlevel-time').textContent = '----/--/-- --:--:--';
                document.getElementById('lastlevel-elapse').textContent = '-:--:--';
            }
        } else {
            if ((getUnixtime_c() - level_bt) / 1000 < 18000) {
                document.getElementById('lastlevel-time').textContent = convert_to_normaltime(level_bt / 1000);
                document.getElementById('lastlevel-elapse').textContent = convert_to_hms(Math.floor((getUnixtime_c() - level_bt) / 1000));
            } else {
                document.getElementById('lastlevel-time').textContent = '----/--/-- --:--:--';
                document.getElementById('lastlevel-elapse').textContent = '-:--:--';
            }
        }
    } else {
        document.getElementById('lastlevel-time').textContent = '----/--/-- --:--:--';
        document.getElementById('lastlevel-elapse').textContent = '-:--:--';
    }
    if (getCurrentlevel() == 100) {
        document.getElementById('is-full').style.display = 'inline';
    } else {
        document.getElementById('is-full').style.display = 'none';
    }
};

function measurement() {
    if (localStorage.start !== undefined && localStorage.end !== undefined) {
        let start = JSON.parse(localStorage.start);
        let end = JSON.parse(localStorage.end);
        let time;
        let level;
        if (start[0] === true && end[0] === true) {
            time = Math.floor((end[1] - start[1]) / 1000);
            document.getElementById('not-start').style.display = 'none';
            document.getElementById('in-process').style.display = 'none';
            document.getElementById('complete').style.display = 'inline';
            document.getElementById('me-time').textContent = convert_to_hms(time);
            if (getCurrentlevel() == -1) {
                document.getElementById('me-level').textContent = '--';
                document.getElementById('me-result').textContent = '-.--';
                document.getElementById('me-unit').style.display = 'inline';
                document.getElementById('me-fail').style.display = 'none';
                document.getElementById('is-present').style.display = 'none';
            } else {
                document.getElementById('me-level').textContent = Math.abs(end[2] - start[2]);
                if (time >= 60) {
                    level = Math.abs(end[2] - start[2]);
                    document.getElementById('me-result').textContent = (Math.round(level / (time / 60) * 100) / 100).toFixed(2);
                    document.getElementById('me-unit').style.display = 'inline';
                    document.getElementById('me-fail').style.display = 'none';
                } else {
                    document.getElementById('me-result').textContent = '';
                    document.getElementById('me-unit').style.display = 'none';
                    document.getElementById('me-fail').style.display = 'inline';
                }
                document.getElementById('is-present').style.display = 'none';
            }
        } else if (start[0] === true && end[0] === false) {
            time = Math.floor((getUnixtime_c() - start[1]) / 1000);
            level = Math.abs(getCurrentlevel() - start[2]);
            document.getElementById('not-start').style.display = 'none';
            document.getElementById('complete').style.display = 'none';
            document.getElementById('in-process').style.display = 'inline';
            document.getElementById('me-time').textContent = convert_to_hms(time);
            if (getCurrentlevel() == -1) {
                document.getElementById('me-level').textContent = '--';
                document.getElementById('me-result').textContent = '-.--';
                document.getElementById('me-unit').style.display = 'inline';
                document.getElementById('me-fail').style.display = 'none';
                document.getElementById('is-present').style.display = 'none';
            } else {
                document.getElementById('me-level').textContent = Math.abs(getCurrentlevel() - start[2]);
                if (time >= 60) {
                    document.getElementById('me-result').textContent = (Math.round(level / (time / 60) * 100) / 100).toFixed(2);
                    document.getElementById('me-unit').style.display = 'inline';
                    document.getElementById('me-fail').style.display = 'none';
                } else {
                    document.getElementById('me-result').textContent = '-.--';
                    document.getElementById('me-unit').style.display = 'inline';
                    document.getElementById('me-fail').style.display = 'none';
                }
                document.getElementById('is-present').style.display = 'inline';
            }
        } else if (start[0] === false && end[0] === false) {
            document.getElementById('complete').style.display = 'none';
            document.getElementById('in-process').style.display = 'none';
            document.getElementById('not-start').style.display = 'inline';
            document.getElementById('me-time').textContent = '-:--:--';
            document.getElementById('me-level').textContent = '--';
            document.getElementById('me-result').textContent = '-.--';
            document.getElementById('me-unit').style.display = 'inline';
            document.getElementById('me-fail').style.display = 'none';
            document.getElementById('is-present').style.display = 'none';
        }
    }
};

if (navigator.getBattery) {
    navigator.getBattery().then(function (battery) {
        battery.addEventListener('chargingchange', function () {
            batteryDisplay_1();
            batteryDisplay_2();
            measurement();
            refresh(battery);
            let charge_bt = localStorage.chargeChangeTime;
            let level_bt = localStorage.levelChangeTime;
            let elapsed_log;
            if (localStorage.chargeChangeTime !== undefined && JSON.parse(localStorage.chargeChangeTime) !== null && (getUnixtime_c() - charge_bt) / 1000 < 18000) {
                elapsed_log = `${convert_to_hms(Math.floor((getUnixtime_c() - charge_bt) / 1000))} (${String(Math.floor((getUnixtime_c() - charge_bt) / 1000)).padStart(4, ' ')}s)`;
            } else {
                elapsed_log = '-:--:-- (----s)';
            }
            let type_log;
            if (isCharge() === true) {
                type_log = 'charging';
            } else {
                type_log = 'discharging';
            }
            addHistory(`[${convert_to_normaltime(getUnixtime())}] type: ${type_log} | elapsed: ${elapsed_log} | level: ${getCurrentlevel()}%`);
            if (getCurrentlevel() == 100 && isCharge() === false && localStorage.levelChangeTime !== undefined) {
                addHistory(`[${convert_to_normaltime(getUnixtime())}] full battery time: ${convert_to_hms(Math.floor((getUnixtime_c() - level_bt) / 1000))} (${String(Math.floor((getUnixtime_c() - level_bt) / 1000)).padStart(4, ' ')}s)`);
            }
            localStorage.chargeChangeTime = getUnixtime_c();
            localStorage.levelChangeTime = getUnixtime_c();
            localStorage.chargeLevel = getCurrentlevel();
            if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === false) {
                localStorage.end = JSON.stringify([true, getUnixtime_c(), getCurrentlevel()]);
                let start = JSON.parse(localStorage.start);
                let end = JSON.parse(localStorage.end);
                let time = Math.floor((end[1] - start[1]) / 1000);
                let level;
                if (getCurrentlevel() == -1) {
                    level = '--';
                    addHistory(`[${convert_to_normaltime(getUnixtime())}] time: ${convert_to_hms(time)}`);
                } else {
                    level = Math.abs(end[2] - start[2]);
                    let type_log;
                    if (isCharge() === true) {
                        type_log = 'discharge efficiency';
                    } else {
                        type_log = 'charge efficiency';
                    }
                    let result_log;
                    if (time > 60) {
                        result_log = `${Math.round(level / (time / 60) * 100) / 100}%/min`;
                    } else {
                        result_log = 'failed';
                    }
                    addHistory(`[${convert_to_normaltime(getUnixtime())}] type: ${type_log} | time: ${convert_to_hms(time)} | level: ${level}% | result: ${result_log}`);
                }
            }
        });

        battery.addEventListener('levelchange', function () {
            batteryDisplay_1();
            batteryDisplay_2();
            measurement();
            refresh(battery);
            let level_bt = localStorage.levelChangeTime;
            let elapsed_log = ``;
            if (localStorage.levelChangeTime !== undefined && (getUnixtime_c() - level_bt) / 1000 < 18000) {
                elapsed_log = `${convert_to_hms(Math.floor((getUnixtime_c() - level_bt) / 1000))} (${String(Math.floor((getUnixtime_c() - level_bt) / 1000)).padStart(4, ' ')}s)`;
            } else {
                elapsed_log = '-:--:-- (----s)';
            }
            let type_log;
            if (getCurrentlevel() == 100) {
                type_log = 'full level';
            } else {
                type_log = 'level change';
            }
            addHistory(`[${convert_to_normaltime(getUnixtime())}] type: ${type_log} | elapsed: ${elapsed_log} | level: ${getCurrentlevel()}%`);
            localStorage.levelChangeTime = getUnixtime_c();
            if (getCurrentlevel() == 100) {
                if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === false) {
                    localStorage.end = JSON.stringify([true, getUnixtime_c(), getCurrentlevel()]);
                    let start = JSON.parse(localStorage.start);
                    let end = JSON.parse(localStorage.end);
                    let time = Math.floor((end[1] - start[1]) / 1000);
                    let level;
                    if (getCurrentlevel() == -1) {
                        level = '--';
                        addHistory(`[${convert_to_normaltime(getUnixtime())}] time: ${convert_to_hms(time)}`);
                    } else {
                        level = Math.abs(end[2] - start[2]);
                        let result_log;
                        if (time > 60) {
                            result_log = `${(Math.round(level / (time / 60) * 100) / 100).toFixed(2)}%/min`;
                        } else {
                            result_log = 'failed';
                        }
                        addHistory(`[${convert_to_normaltime(getUnixtime())}] type: charge efficiency | time: ${convert_to_hms(time)} | level: ${level}% | result: ${result_log}`);
                    }
                }
                alertOpen(`Battery is full. (${convert_to_normaltime(getUnixtime())})`);
            }
        });

        battery.addEventListener('chagingtimechange', function () {
            batteryDisplay_1();
            batteryDisplay_2();
            refresh(battery);
        });

        battery.addEventListener('dischargingtimechange', function () {
            batteryDisplay_1();
            batteryDisplay_2();
            refresh(battery);
        });

    });
}

batteryDisplay_1();
batteryDisplay_2();
measurement();

setInterval(() => {
    batteryDisplay_1();
    batteryDisplay_2();
    measurement();
}, 1)

if (localStorage.log == '' || localStorage.log === undefined) {
    document.getElementById('history').value = '';
    localStorage.log = '';
} else {
    document.getElementById('history').value = localStorage.log;
}

if (localStorage.start === undefined) {
    localStorage.start = JSON.stringify([false, null, null]);
}
if (localStorage.end === undefined) {
    localStorage.end = JSON.stringify([false, null, null]);
}

document.getElementById('delete').addEventListener('click', function () {
    confirmOpen('Are you sure to delete about the \"Last charge status change\" information?', 'delete')
});

document.getElementById('start').addEventListener('click', function () {
    if (getCurrentlevel() == 100 && isCharge()) {
        alertOpen('Cannot start because battery is full.');
    } else {
        if (JSON.parse(localStorage.start)[0] === false && JSON.parse(localStorage.end)[0] === false) {
            localStorage.start = JSON.stringify([true, getUnixtime_c(), getCurrentlevel()]);
        } else if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === false) {
            alertOpen('Already started.');
        } else if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === true) {
            alertOpen('Cannot start because it\'s completed. Please reset firstly.');
        }
    }
});

document.getElementById('stop').addEventListener('click', function () {
    if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === false) {
        confirmOpen('Are you sure to stop?', 'stop');
    } else if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === true) {
        alertOpen('Cannot stop bacause it\'s completed. Please reset firstly.');
    } else {
        alertOpen('Not started yet.');
    }
});

document.getElementById('reset').addEventListener('click', function () {
    if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === true) {
        confirmOpen('Are you sure to reset?', 'reset');
    } else if (JSON.parse(localStorage.start)[0] === true && JSON.parse(localStorage.end)[0] === false) {
        confirmOpen('The record will be deleted without any result because it\'s in process. Are you sure to reset?', 'reset');
    } else if (JSON.parse(localStorage.start)[0] === false && JSON.parse(localStorage.end)[0] === false) {
        alertOpen('Cannnot reset.');
    }
});

document.getElementById('clear').addEventListener('click', function () {
    confirmOpen('Are you sure to clear these histories?', 'clear');
});

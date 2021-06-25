const date = (date) => {
    return { 'Date': date }
}

const checkIn = (checkInTime, location) => {
    return { 
        'PunchIn': checkInTime,
        'Location': location 
    }
}

const checkOut = (checkOutTime) => {
    return { 'PunchOut': checkOutTime }
}

const offWorkStart = (type, start) => {
    return { 
        'OffWorkType': type,
        'OffWorkStart': start
    }
}

const offWorkEnd = (end) => {
    return {
        'OffWorkEnd': end
    }
}

const activity = (name, time, member) => {
    return {
        'ActivityName': name,
        'ActivityTime': time,
        'ActivityMember': member
    }
}

const activity2 = (name, time, member) => {
    return {
        'ActivityName2': name,
        'ActivityTime2': time,
        'ActivityMember2': member
    }
}

const activity3 = (name, time, member) => {
    return {
        'ActivityName3': name,
        'ActivityTime3': time,
        'ActivityMember3': member
    }
}

const activity4 = (name, time, member) => {
    return {
        'ActivityName4': name,
        'ActivityTime4': time,
        'ActivityMember4': member
    }
}

const activity5 = (name, time, member) => {
    return {
        'ActivityName5': name,
        'ActivityTime5': time,
        'ActivityMember5': member
    }
}

module.exports = {
    date,
    checkIn,
    checkOut,
    offWorkStart,
    offWorkEnd,
    activity,
    activity2,
    activity3,
    activity4,
    activity5
};
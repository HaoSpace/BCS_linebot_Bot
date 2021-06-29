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
const activity6 = (name, time, member) => {
    return {
        'ActivityName6': name,
        'ActivityTime6': time,
        'ActivityMember6': member
    }
}
const activity7 = (name, time, member) => {
    return {
        'ActivityName7': name,
        'ActivityTime7': time,
        'ActivityMember7': member
    }
}
const activity8 = (name, time, member) => {
    return {
        'ActivityName8': name,
        'ActivityTime8': time,
        'ActivityMember8': member
    }
}
const activity9 = (name, time, member) => {
    return {
        'ActivityName9': name,
        'ActivityTime9': time,
        'ActivityMember9': member
    }
}
const activity10 = (name, time, member) => {
    return {
        'ActivityName10': name,
        'ActivityTime10': time,
        'ActivityMember10': member
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
    activity5,
    activity6,
    activity7,
    activity8,
    activity9,
    activity10
};
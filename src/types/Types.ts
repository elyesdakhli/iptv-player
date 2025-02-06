
export type Source = {
    name: string;
    url: string;
    username: string;
    password: string;
    type: 'XTREAM_CODES' | 'PLAYLIST';
    active: boolean;
}

export type Category = {
    categoryId: string;
    categoryName: string;
    parentId: string;
}

export type Stream = {
    num: number;
    name: string;
    streamType: string;
    streamId: number;
    streamIcon: string;
    epgChannelId: string;
    added: number,
    isAdult: number,
    categoryId: number,
    categoryIds: number[],
    customSid: string,
    tvArchive: number,
    directSource: string;
    tvArchiveDuration: number
};

export type UserInfo = {
    username: string;
    password: string;
    message: string;
    auth: number;
    status: string;
    expDate: number;
    isTrial: string;
    activeCons: string;
    createdAt: number;
    maxConnections: string;
    allowedOutputFormats: string[];
}

export type ServerInfo = {
    url: string;
    port: string;
    httpsPort: string;
    serverProtocol: string;
    rtmpPort: string;
    timezone: string;
    timestampNow: number;
    timeNow: string;
    process: boolean
}

export type GlobalInfos = {
    userInfo: UserInfo;
    serverInfo: ServerInfo;
}
import {Category, GlobalInfos, Source} from "../types/Types.ts";
import axios from "axios";

//Api response types
type CategoryResponse = {
    category_id: string,
    category_name: string,
    parent_id: number
}

type StreamResponse = {
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    stream_icon: string;
    epg_channel_id: string;
    added: string;
    is_adult: number;
    category_id: string;
    category_ids: number[];
    custom_sid: string;
    tv_archive: number;
    direct_source: string;
    tv_archive_duration: number;
}

//Api Paths
const PLAYER_API_PATH = 'player_api.php';
const CATEGORIES_API_PATH = 'get_live_categories';
const STREAMS_OF_CATEGORY_API_PATH = 'get_live_streams';

export const connect = async  (source: Source): Promise<GlobalInfos | null> => {
    if(!source?.url || !source?.username ||!source?.password)
        return null;

    try {
        const apiResponse =
            await axios.get(`${source.url}/${PLAYER_API_PATH}?username=${source.username}&password=${source.password}`);

        const responseData = apiResponse.data;
        const responseUserInfo = responseData.user_info;
        const responseServerInfo = responseData.server_info;
        return Promise.resolve({
                userInfo: {
                    username: responseUserInfo.username,
                    password: responseUserInfo.password,
                    message: responseUserInfo.message,
                    auth: responseUserInfo.auth,
                    status: responseUserInfo.status,
                    expDate: parseInt(responseUserInfo.exp_date, 10),
                    isTrial: responseUserInfo.is_trial,
                    activeCons: responseUserInfo.active_cons,
                    createdAt: responseUserInfo.created_at,
                    maxConnections: responseUserInfo.max_connections,
                    allowedOutputFormats: responseUserInfo.allowed_output_formats
                },
                serverInfo: {
                    url: responseServerInfo.url,
                    port: responseServerInfo.port,
                    httpsPort: responseServerInfo.https_port,
                    serverProtocol: responseServerInfo.server_protocol,
                    rtmpPort: responseServerInfo.rtmp_port,
                    timezone: responseServerInfo.timezone,
                    timestampNow: responseServerInfo.timestamp_now,
                    timeNow: responseServerInfo.time_now,
                    process: responseServerInfo.process
                }
            });

    }catch (error ){
        console.error(error);
        return Promise.reject(error);
    }
}

export const getCategories = async (source: Source): Promise<Category[]> => {
    try {
        const apiResponse =
            await axios.get(`${source.url}/${PLAYER_API_PATH}?username=${source.username}&password=${source.password}&action=${CATEGORIES_API_PATH}`)

        return Promise.resolve(apiResponse.data.map((cat: CategoryResponse) => (
            {
                categoryId: cat.category_id,
                categoryName: cat.category_name,
                parentId: cat.parent_id
            }
        )));
    }catch (error ){
        console.log(error);
        return Promise.reject(error);
    }
}

export const getStreams = async (source: Source, category: Category) => {
    try {
        const apiResponse = await axios.get(`${source.url}/${PLAYER_API_PATH}` +
            `?username=${source.username}
            &password=${source.password}
            &action=${STREAMS_OF_CATEGORY_API_PATH}
            &category_id=${category.categoryId}`);

        return Promise.resolve(apiResponse.data.map((stream: StreamResponse) => (
            {
                num: stream.num,
                name: stream.name,
                streamType: stream.stream_type,
                streamId: stream.stream_id,
                streamIcon: stream.stream_icon,
                epgChannelId: stream.epg_channel_id,
                added: stream.added,
                isAdult: stream.is_adult,
                categoryId: stream.category_id,
                categoryIds: stream.category_ids,
                customSid: stream.custom_sid,
                tvArchive: stream.tv_archive,
                directSource: stream.direct_source,
                tvArchiveDuration: stream.tv_archive_duration
            }
        )));
    }catch (error){
        console.log(error);
        return Promise.reject(error);
    }
}


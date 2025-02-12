import {AppMode, Category, GlobalInfos, Source, Stream, VodStream} from "../types/Types.ts";
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

type VodStreamResponse = StreamResponse & {
    rating: string,
    rating_5based: string,
    tmdb: string,
    trailer: string,
    container_extension: string
}

//Api Paths
const PLAYER_API_PATH = 'player_api.php';
const TV_CATEGORIES_API_ACTION = 'get_live_categories';
const VOD_CATEGORIES_API_ACTION = 'get_vod_categories';
const TV_CATEGORY_STREAMS_API_ACTION = 'get_live_streams';
const VOD_CATEGORY_STREAMS_API_ACTION = 'get_vod_streams';
const VOD_STREAM_INFO_API_ACTION = 'get_vod_info';


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

export const getCategories = async (source: Source, mode: AppMode): Promise<Category[]> => {
    try {
        const action = mode === 'TV' ?
            TV_CATEGORIES_API_ACTION : VOD_CATEGORIES_API_ACTION;
        const apiResponse =
            await axios.get(`${source.url}/${PLAYER_API_PATH}?username=${source.username}&password=${source.password}&action=${action}`)

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

export const getStreams = async (source: Source, category: Category, mode: AppMode) => {
    try {
        const action = mode === 'TV' ? TV_CATEGORY_STREAMS_API_ACTION : VOD_CATEGORY_STREAMS_API_ACTION;
        let  url = source.url +'/'+PLAYER_API_PATH +
            '?username='+source.username + '&password=' +source.password +
            '&action=' + action;
        url += (category?.categoryId === 'ALL') ? '' : '&category_id=' + category.categoryId
        const apiResponse = await axios.get(url);

        return mode === 'TV' ? Promise.resolve(mapAllStreamResponseToStream(apiResponse.data))
            :Promise.resolve(mapAllVodStreamResponseToVodStream(apiResponse.data));
    }catch (error){
        console.log(error);
        return Promise.reject(error);
    }
}


export type VodStreamInfo = {
    name: string,
    director: string,
    releaseDate: string,
    cast: string,
    description: string,
    genre: string
    movieImage: string,
    duration: string
}

export const getVodStreamInfo = async (source: Source, streamId: string): Promise<VodStreamInfo> => {
    try {
        const  url = source.url +'/'+PLAYER_API_PATH +
            '?username='+source.username + '&password=' +source.password +
            '&action=' + VOD_STREAM_INFO_API_ACTION +
            '&vod_id=' + streamId;
        const apiResponse = await axios.get(url);
        const vodResponseInfo = apiResponse.data.info;

        return Promise.resolve({
            name: vodResponseInfo.name,
            director: vodResponseInfo.director,
            movieImage: vodResponseInfo.movie_image,
            releaseDate: vodResponseInfo.releasedate,
            cast : vodResponseInfo.cast || vodResponseInfo.actors,
            description: vodResponseInfo.description || vodResponseInfo.plot,
            genre: vodResponseInfo.genre,
            duration: vodResponseInfo.duration
        });
    }catch (error){
        console.log(error);
        return Promise.reject(error);
    }
}
//  Mappers
const mapAllStreamResponseToStream = (streams: StreamResponse[]): Stream[] => {
    return streams.map((stream: StreamResponse) => mapStreamResponseToStream(stream));
}
const mapStreamResponseToStream = (stream: StreamResponse): Stream => {
    return {
        num: stream.num,
        name: stream.name,
        streamType: stream.stream_type,
        streamId: stream.stream_id,
        streamIcon: stream.stream_icon,
        epgChannelId: stream.epg_channel_id,
        added: stream.added ? Number.parseInt(stream.added): 0,
        isAdult: stream.is_adult,
        categoryId: stream.category_id ? Number.parseInt(stream.category_id): 0,
        categoryIds: stream.category_ids,
        customSid: stream.custom_sid,
        tvArchive: stream.tv_archive,
        directSource: stream.direct_source,
        tvArchiveDuration: stream.tv_archive_duration
    }
}
const mapAllVodStreamResponseToVodStream = (streams: VodStreamResponse[]): VodStream[] => {
    return streams.map((stream: VodStreamResponse) => mapStreamResponseToVodStream(stream));
}
const mapStreamResponseToVodStream = (stream: VodStreamResponse): VodStream => {
    return {
        ...mapStreamResponseToStream(stream),
        rating: stream.rating,
        ratingFiveBased: stream.rating_5based,
        tmdb: stream.tmdb,
        trailer: stream.trailer,
        containerExtension: stream.container_extension
    }
}
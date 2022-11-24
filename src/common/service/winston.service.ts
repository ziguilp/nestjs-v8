import { getNamespace } from 'cls-hooked';
import { format } from 'logform';
import { appConfig } from 'src/config';

let appNamespace = null;

export const WinstonTraceUtil = {
    format: {
        traceId: format((info) => {
            if (!appNamespace) {
                appNamespace = getNamespace(appConfig.appNameSpace)
            }
            info.traceId = appNamespace.get('traceId') || ''
            return info
        })
    }
}

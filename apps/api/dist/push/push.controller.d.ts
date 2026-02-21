import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PushService } from './push.service';
import { SubscribeDto, UnsubscribeDto } from './dto';
export declare class PushController {
    private readonly push;
    constructor(push: PushService);
    getVapidPublic(): {
        publicKey: string | null;
    };
    subscribe(user: CurrentUserPayload, dto: SubscribeDto): Promise<{
        success: boolean;
    }>;
    unsubscribe(user: CurrentUserPayload, dto: UnsubscribeDto): Promise<{
        success: boolean;
    }>;
}

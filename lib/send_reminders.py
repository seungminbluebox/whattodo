import os
import json
from datetime import datetime, timedelta
from supabase import create_client, Client
from pywebpush import webpush, WebPushException
from dotenv import load_dotenv

# .env 파일 로드 (루트 디렉토리의 .env 파일을 찾습니다)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# 환경 변수 설정
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# 주의: RLS를 우회하기 위해 ANON_KEY가 아닌 SERVICE_ROLE_KEY가 필요합니다.
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY")
# 이메일은 VAPID 명세에 포함되어야 하며, 실제 본인 이메일로 수정하세요.
VAPID_CLAIMS = {"sub": "mailto:admin@example.com"}

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def send_daily_reminders():
    # 1. 내일 날짜 계산 (YYYY-MM-DD 형식)
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"--- {tomorrow} 마감 할 일 조회 중 ---")

    # 2. 내일 마감이고 완료되지 않은 할 일 조회
    response = supabase.table("todos") \
        .select("user_id, content") \
        .eq("due_date", tomorrow) \
        .eq("is_completed", False) \
        .execute()
    
    todos = response.data

    if not todos:
        print("내일 마감인 할 일이 없습니다.")
        return

    # 3. 알림 발송 로직
    for todo in todos:
        user_id = todo['user_id']
        content = todo['content']

        # 해당 유저의 푸시 구독 정보 가져오기
        sub_resp = supabase.table("push_subscriptions") \
            .select("subscription") \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not sub_resp.data:
            print(f"유저 {user_id}의 구독 정보가 없습니다.")
            continue

        subscription_info = sub_resp.data['subscription']

        # 푸시 알림 전송
        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({
                    "title": "🔔 내일 마감 할 일!",
                    "body": content,
                    "url": "/whattodo/"
                }),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            print(f"성공: [{content}] 알림을 유저 {user_id}에게 보냈습니다.")
        except WebPushException as ex:
            print(f"실패: 유저 {user_id}에게 알림 전송 중 오류 발생: {ex}")

if __name__ == "__main__":
    send_daily_reminders()
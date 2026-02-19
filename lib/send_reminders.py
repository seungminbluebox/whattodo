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
    # 1. 오늘 날짜 계산 (YYYY-MM-DD 형식)
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"--- {today} 오늘 할 일 요약 알림 발송 중 ---")

    # 2. 모든 푸시 구독 정보 가져오기
    subscriptions = supabase.table("push_subscriptions").select("user_id, subscription").execute().data
    if not subscriptions:
        print("구독된 유저가 없습니다.")
        return

    # 3. 각 유저별로 오늘 남아있는 할 일들을 요약해서 전송
    for sub in subscriptions:
        user_id = sub['user_id']
        subscription_info = sub['subscription']
        
        # 해당 유저의 오늘 할 일 중 '완료되지 않고 삭제되지 않은' 것들만 조회
        response = supabase.table("todos") \
            .select("content, due_date") \
            .eq("user_id", user_id) \
            .or_(f"planned_date.eq.{today},due_date.eq.{today}") \
            .eq("is_completed", False) \
            .eq("is_deleted", False) \
            .execute()
        
        pending_todos = response.data
        
        if not pending_todos:
            print(f"유저 {user_id}: 오늘 남은 할 일이 없어 알림을 보내지 않습니다.")
            continue

        # 정렬 로직: 기한(due_date)이 있는 할 일부터 먼저, 이어서 기한 없는 할 일 순서로 정렬
        pending_todos.sort(key=lambda t: (t.get('due_date') is None, t.get('due_date')))

        # 알림 메시지 생성 (모든 할 일을 정렬된 순서대로 나열)
        count = len(pending_todos)
        task_list = "\n".join([f"• {t['content']}" for t in pending_todos])
        body = f"오늘 {count}개의 할 일이 남아있어요:\n{task_list}"

        # 푸시 알림 전송 (단 한 번!)
        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({
                    "title": "🔔 오늘의 할 일 목록",
                    "body": body,
                    "url": "/whattodo/?view=today"
                }),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS,
                headers={
                    "Urgency": "high",
                    "TTL": "86400"
                }
            )
            print(f"성공: 유저 {user_id}에게 {count}개의 할 일 목록을 보냈습니다.")
        except WebPushException as ex:
            print(f"실패: 유저 {user_id}에게 알림 전송 중 오류 발생: {ex}")

if __name__ == "__main__":
    send_daily_reminders()
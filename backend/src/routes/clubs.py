from sanic import Blueprint
from sanic.response import json
from src.services.club_service import ClubService
from src.middleware import authorized, inject_user

clubs_bp = Blueprint("clubs", url_prefix="/clubs")

# --- KULÜP LİSTELEME VE DETAY (HERKESE AÇIK / OPSİYONEL AUTH) ---

@clubs_bp.get("/")
@inject_user()
async def list_clubs(request):
    """
    Tüm aktif kulüpleri listeler. 
    Kullanıcı giriş yapmışsa 'is_following' ve 'is_president' bilgilerini de döner.
    """
    redis = request.app.ctx.redis
    user_id = None
    
    # inject_user sayesinde token varsa user_id çekilir, yoksa hata vermez
    if hasattr(request.ctx, "user") and request.ctx.user:
        user_id = request.ctx.user.get("sub")
        
    result, status = await ClubService.get_all_clubs(user_id=user_id, redis=redis)
    return json(result, status=status)

@clubs_bp.get("/<club_id:int>")
@inject_user() # Detayda üye listesini sadece yetkililer görebilmesi için eklendi
async def get_club(request, club_id: int):
    """Belirli bir kulübün detaylarını getirir."""
    user_ctx = getattr(request.ctx, "user", None)
    result, status = await ClubService.get_club_details(club_id, user_ctx)
    return json(result, status=status)

# --- KULÜP YÖNETİMİ (ZORUNLU AUTH) ---

@clubs_bp.post("/")
@authorized()
async def create_club(request):
    """Yeni kulüp oluşturma başvurusu yapar."""
    redis = request.app.ctx.redis
    result, status = await ClubService.create_club(request.ctx.user, request.json, redis)
    return json(result, status=status)

@clubs_bp.post("/<club_id:int>/approve")
@authorized()
async def approve_club(request, club_id: int):
    """Bekleyen kulüp başvurusunu onaylar (Admin Kontrolü Service içindedir)."""
    redis = request.app.ctx.redis
    result, status = await ClubService.approve_club(request.ctx.user, club_id, redis)
    return json(result, status=status)

@clubs_bp.delete("/<club_id:int>")
@authorized()
async def delete_club(request, club_id: int):
    """Kulübü siler (Soft-delete)."""
    redis = request.app.ctx.redis
    result, status = await ClubService.delete_club(request.ctx.user, club_id, redis)
    return json(result, status=status)

@clubs_bp.get("/my-clubs")
@authorized()
async def get_my_clubs(request):
    """Kullanıcının başkanı olduğu veya (admin ise) tüm kulüpleri getirir."""
    result, status = await ClubService.get_my_clubs(request.ctx.user)
    return json(result, status=status)

# --- ÜYELİK VE ÜYE YÖNETİM İŞLEMLERİ (ZORUNLU AUTH) ---

@clubs_bp.get("/<club_id:int>/members")
@authorized()
async def get_club_members(request, club_id: int):
    """
    ÖNEMLİ: Başkan panelinde üyelerin listelenmesini sağlar.
    ClubDashboard.jsx içindeki api.get('/clubs/${club.id}/members') isteğini karşılar.
    """
    result, status = await ClubService.get_club_members(request.ctx.user, club_id)
    return json(result, status=status)

@clubs_bp.delete("/<club_id:int>/members/<target_user_id:int>")
@authorized()
async def remove_member_alt(request, club_id: int, target_user_id: int):
    """
    ÖNEMLİ: Başkan panelinde üyeyi kulüpten çıkarmayı sağlar.
    ClubDashboard.jsx içindeki api.delete(`/clubs/${clubId}/members/${userId}`) isteğini karşılar.
    """
    result, status = await ClubService.remove_follower(request.ctx.user, club_id, target_user_id)
    return json(result, status=status)

@clubs_bp.post("/<club_id:int>/follow")
@authorized()
async def follow_club(request, club_id: int):
    """Kullanıcının bir kulübe katılmasını sağlar."""
    result, status = await ClubService.follow_club(request.ctx.user, club_id)
    return json(result, status=status)

@clubs_bp.post("/<club_id:int>/leave")
@authorized()
async def leave_club(request, club_id: int):
    """Kullanıcının kulüpten ayrılmasını sağlar."""
    result, status = await ClubService.leave_club(request.ctx.user, club_id)
    return json(result, status=status)

@clubs_bp.post("/<club_id:int>/remove-member")
@authorized()
async def remove_member(request, club_id: int):
    """Bir üyeyi kulüpten çıkarır (Body üzerinden user_id alır - Eski versiyon desteği için)."""
    target_user_id = request.json.get("user_id")
    if not target_user_id:
        return json({"error": "User ID is required to remove a member"}, 400)
    
    result, status = await ClubService.remove_follower(request.ctx.user, club_id, target_user_id)
    return json(result, status=status)
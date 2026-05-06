from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from . import Base


class WaitlistLead(Base):
    __tablename__ = "waitlist_leads"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    role: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    neighborhood: Mapped[str] = mapped_column(String, nullable=False)

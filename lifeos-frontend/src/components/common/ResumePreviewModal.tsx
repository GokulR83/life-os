import React from 'react';
import { FileText, ExternalLink, Download, X, Shield, Sparkles } from 'lucide-react';
import { Badge } from './Badge';

export interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: {
    id?: string;
    _id?: string;
    filename: string;
    targetRole: string;
    uploadDate?: string;
    notes?: string;
    fileUrl?: string;
  } | null;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  resume,
}) => {
  if (!isOpen || !resume) return null;

  const getEmbedUrl = (url?: string) => {
    if (!url) return null;

    // Convert Google Drive view/edit links to preview embed format
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  const embedUrl = getEmbedUrl(resume.fileUrl);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl border border-theme-border bg-theme-card shadow-2xl p-6 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-theme-main tracking-tight">{resume.filename}</h3>
                <Badge variant="orange" size="sm">{resume.targetRole}</Badge>
              </div>
              <p className="text-xs text-theme-muted mt-0.5">
                Uploaded {resume.uploadDate || 'Recently'} {resume.notes ? `• ${resume.notes}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {resume.fileUrl && (
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-card-hover border border-theme-border text-theme-accent font-bold text-xs transition flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Link</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-surface transition cursor-pointer"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 min-h-[480px] rounded-2xl border border-theme-border bg-theme-surface/50 overflow-hidden relative flex flex-col justify-center items-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-[540px] rounded-2xl border-0"
              title={`PDF Preview - ${resume.filename}`}
              allow="autoplay"
            />
          ) : (
            <div className="p-8 text-center max-w-md space-y-3">
              <div className="p-4 rounded-3xl bg-theme-accent-light/50 text-theme-accent border border-theme-border mx-auto w-fit">
                <FileText className="h-12 w-12" />
              </div>
              <h4 className="text-base font-extrabold text-theme-main">{resume.filename}</h4>
              <Badge variant="orange" size="md">{resume.targetRole}</Badge>
              <p className="text-xs text-theme-muted leading-relaxed">
                {resume.notes || 'No Google Drive link attached yet. Edit or upload a new version to attach your Google Drive PDF link.'}
              </p>
              <div className="pt-3 p-4 rounded-2xl bg-theme-card border border-theme-border text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-theme-muted font-semibold">
                  <span>Document Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Ready for HR Applications
                  </span>
                </div>
                <div className="h-2 bg-theme-surface rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-dual w-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-theme-border flex items-center justify-between text-xs text-theme-muted">
          <span>LifeOS Resume Version Manager</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-surface border border-theme-border hover:bg-theme-card-hover text-theme-main font-bold transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
